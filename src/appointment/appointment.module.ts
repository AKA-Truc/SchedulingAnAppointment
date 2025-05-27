import { Module } from '@nestjs/common';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './service/appointment.service';
import { NotificationService } from './service/notification.service';
import { FollowUpService } from './service/followUp.service';
import { FeedbackService } from './service/feedBack.service';
import { RedisModule } from '@nestjs-modules/ioredis';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [RedisModule, PrismaModule], 
  controllers: [AppointmentController],
  providers: [AppointmentService, NotificationService, FollowUpService, FeedbackService],
})
export class AppointmentModule {}
