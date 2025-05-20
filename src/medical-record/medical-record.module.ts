import { Module } from '@nestjs/common';
import { MedicalRecordController } from './medical-record.controller';
import { MedicalRecordService } from './medical-record.service';

@Module({
  controllers: [MedicalRecordController],
  providers: [MedicalRecordService]
})
export class MedicalRecordModule {}
