import { Module } from '@nestjs/common';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './service/appointment.service';
import { RedisModule } from '@nestjs-modules/ioredis';

@Module({
  imports: [RedisModule], 
  controllers: [AppointmentController],
  providers: [AppointmentService]
})
export class AppointmentModule {}
