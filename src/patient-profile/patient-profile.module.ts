import { Module } from '@nestjs/common';
import { PatientProfileController } from './patient-profile.controller';
import { PatientProfileService } from './patient-profile.service';

@Module({
  controllers: [PatientProfileController],
  providers: [PatientProfileService]
})
export class PatientProfileModule {}
