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
import { PrismaModule } from 'src/prisma/prisma.module';
import { ScheduleModule } from '@nestjs/schedule';
import { UserService } from 'src/user/user.service';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    MailModule,
    UserModule
  ],
  controllers: [AppointmentController],
  providers: [
    AppointmentService, 
    NotificationService, 
    FollowUpService, 
    FeedbackService, 
    EmailService, 
    NotificationWorker,
    NotificationGateway,
    UserService,
  ],
  exports: [AppointmentService, NotificationService, FollowUpService, FeedbackService],
})
export class AppointmentModule { }
