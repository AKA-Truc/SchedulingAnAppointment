import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { AppointmentModule } from '../appointment/appointment.module';

@Module({
  imports: [HttpModule, AppointmentModule],
  controllers: [PaymentController],
  providers: [PaymentService]
})
export class PaymentModule {}
