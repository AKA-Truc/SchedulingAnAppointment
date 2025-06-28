import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule'; // 🆕 Cron support
import { PatientProfileController } from './patient-profile.controller';
import { PatientProfileService } from './patient-profile.service';
import { PrismaModule } from '../prisma/prisma.module'; // 🆕 Cron job service
import { MongoPrismaModule } from '../prisma/mongo-prisma.module'; // 🆕 cần nếu dùng Mongo Prisma
import { EventEmitterModule } from '@nestjs/event-emitter';


@Module({
    imports: [
        PrismaModule,
        MongoPrismaModule,
        ScheduleModule.forRoot(),
        EventEmitterModule.forRoot(),
        
    ],
    controllers: [PatientProfileController],
    providers: [
        PatientProfileService,
    ],
    exports: [PatientProfileService]
})
export class PatientProfileModule { }
