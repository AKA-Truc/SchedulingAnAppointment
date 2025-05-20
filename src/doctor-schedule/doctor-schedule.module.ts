import { Module } from '@nestjs/common';
import { DoctorScheduleController } from './doctor-schedule.controller';
import { DoctorScheduleService } from './doctor-schedule.service';

@Module({
  controllers: [DoctorScheduleController],
  providers: [DoctorScheduleService]
})
export class DoctorScheduleModule {}
