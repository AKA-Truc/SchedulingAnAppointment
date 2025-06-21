import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { DoctorModule } from './doctor/doctor.module';
import { HospitalModule } from './hospital/hospital.module';
import { PatientProfileModule } from './patient-profile/patient-profile.module';
import { AppointmentModule } from './appointment/appointment.module';
import { PaymentModule } from './payment/payment.module';
import { RedisModule } from '@nestjs-modules/ioredis';
import { SignalingModule } from './video/signaling.module';
import { ConfigModule } from '@nestjs/config';
import * as path from 'path';
import { ApplicationInitService } from './config/application.init.service';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/guard/auth.guard';
import { ServicesModule } from './service/service.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    RedisModule.forRoot({
      type: 'single',
      url: 'redis://localhost:6379',
    }),
    ChatModule,
    UserModule,
    PrismaModule,
    AuthModule,
    DoctorModule,
    HospitalModule,
    PatientProfileModule,
    AppointmentModule,
    ServicesModule,
    PaymentModule,
    SignalingModule,
    ConfigModule.forRoot({
      envFilePath: path.resolve(__dirname, '../.env'),
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, ApplicationInitService, { provide: APP_GUARD, useClass: AuthGuard, }],
})
export class AppModule { }
