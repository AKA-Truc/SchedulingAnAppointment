import { Module } from '@nestjs/common';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './service/appointment.service';
import { NotificationService } from './service/notification.service';
import { FollowUpService } from './service/followUp.service';
import { FeedbackService } from './service/feedBack.service';
import { NotificationWorker } from './service/notification.worker';
import { NotificationGateway } from './service/notification.gateway';
import { EmailService } from 'src/email/email.service';
import { MailModule } from 'src/email/email.module';
import Redis from 'ioredis';
import { RedisModule } from '@nestjs-modules/ioredis';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [RedisModule, PrismaModule, MailModule,
    ScheduleModule.forRoot(),
    RedisModule,
    PrismaModule,
    MailModule,
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService, NotificationService, FollowUpService, FeedbackService, EmailService, NotificationWorker,
    NotificationGateway,
    {
      provide: Redis,
      useFactory: () => new Redis(process.env.REDIS_URL || 'redis://localhost:6379'),
    },],
})
export class AppointmentModule { }
