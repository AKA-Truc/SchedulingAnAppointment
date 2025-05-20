import { Module } from '@nestjs/common';
import { AppointmentReminderController } from './appointment-reminder.controller';
import { AppointmentReminderService } from './appointment-reminder.service';

@Module({
  controllers: [AppointmentReminderController],
  providers: [AppointmentReminderService]
})
export class AppointmentReminderModule {}
