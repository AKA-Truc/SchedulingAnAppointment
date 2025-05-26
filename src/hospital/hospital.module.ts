import { Module } from '@nestjs/common';
import { HospitalController } from './hospital.controller';
import { HospitalService } from './hospital.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ReviewHospitalService } from './reviewHospital.service';

@Module({
  imports: [PrismaModule],
  controllers: [HospitalController],
  providers: [HospitalService,ReviewHospitalService]
})
export class HospitalModule {}
