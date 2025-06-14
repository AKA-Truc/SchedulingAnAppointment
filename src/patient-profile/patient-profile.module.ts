import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule'; // 🆕 Cron support
import { PatientProfileController } from './patient-profile.controller';
import { PatientProfileService } from './patient-profile.service';
import { PrismaModule } from '../prisma/prisma.module';
import { FHIRController } from './fhir/controllers/fhir.controller';
import { FHIRService } from './fhir/services/fhir.service';
import { FhirCacheService } from './fhir/services/fhir-cache.service'; // 🆕 Cron job service
import { PatientFHIRMapper } from './fhir/patient-fhir.mapper';
import { PatientEncryptionService } from './encryption/patient-encryption.service';
import { MongoPrismaModule } from '../prisma/mongo-prisma.module'; // 🆕 cần nếu dùng Mongo Prisma
import { PatientTelemetryService } from './telemetry/patient-telemetry.service';
import { TelemetryKafkaService } from './telemetry/services/telemetry-kafka.service';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    PrismaModule,
    MongoPrismaModule,
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    ConfigModule.forFeature(() => ({
      FHIR_SERVER_URL: {type: 'string',
      required: true
    },
    KAFKA_BROKERS: {
      type: 'string',
      required: true,
      default: 'localhost:9092'
    },
    MQTT_BROKER_URL: {
      type: 'string',
      required: true,
      default: 'mqtt://localhost:1883'
    }
    }))
  ],
  controllers: [PatientProfileController, FHIRController],
  providers: [
    PatientProfileService,
    FHIRService,
    FhirCacheService, // 🆕 cron job provider
    PatientFHIRMapper,
    PatientEncryptionService,
    PatientTelemetryService,
    TelemetryKafkaService
  ],
  exports: [PatientProfileService, FHIRService]
})
export class PatientProfileModule {}
