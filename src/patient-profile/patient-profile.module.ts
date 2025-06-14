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

@Module({
  imports: [
    PrismaModule,
    MongoPrismaModule, // 🆕 dùng cho caching
    ScheduleModule.forRoot(), // 🆕 cần cho cron
    ConfigModule.forFeature(() => ({
      FHIR_SERVER_URL: {
        type: 'string',
        required: true
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
  ],
  exports: [PatientProfileService, FHIRService]
})
export class PatientProfileModule {}
