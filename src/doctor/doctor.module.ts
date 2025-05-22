import { Module } from '@nestjs/common';
import { DoctorController } from './doctor.controller';
import { DoctorService } from './service/doctor.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { CertificationService } from './service/certification.service';
import { SpecialtyService } from './service/specialty.service';
import { AchievementService } from './service/achievement.service';
import { DoctorScheduleService } from './service/doctorSchedule.service';

@Module({
  imports: [PrismaModule, CloudinaryModule, ConfigModule],
  controllers: [DoctorController],
  providers: [DoctorService, CertificationService, SpecialtyService, AchievementService, DoctorScheduleService]
})
export class DoctorModule { }
