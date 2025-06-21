import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DoctorController } from './doctor.controller';

import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { PrismaModule } from 'src/prisma/prisma.module';

import { AchievementService } from './service/achievement.service';
import { CertificationService } from './service/certification.service';
import { DoctorScheduleService } from './service/doctorSchedule.service';
import { DoctorService } from './service/doctor.service';
import { SpecialtyService } from './service/specialty.service';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    CloudinaryModule,
    ConfigModule,
    PrismaModule,
    UserModule,
  ],
  controllers: [DoctorController],
  providers: [
    AchievementService,
    CertificationService,
    DoctorScheduleService,
    DoctorService,
    SpecialtyService,
  ],
})
export class DoctorModule { }
