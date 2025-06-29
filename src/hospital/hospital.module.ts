import { Module } from '@nestjs/common';
import { HospitalController } from './hospital.controller';
import { HospitalService } from './services/hospital.service';
import { PrismaModule } from 'src/prisma/prisma.module';
// import { ReviewHospitalService } from './services/reviewHospital.service';
import { DashboardHospitalService } from './services/dashboard.service';
import { AchievementHospitalService } from './services/achievement.hospital.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [HospitalController],
  providers: [HospitalService,
    // ReviewHospitalService,
    DashboardHospitalService, AchievementHospitalService]
})
export class HospitalModule { }
