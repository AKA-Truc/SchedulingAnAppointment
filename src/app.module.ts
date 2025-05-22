import { Module } from '@nestjs/common';
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
import { ConfigModule } from '@nestjs/config';
import * as path from 'path';

@Module({
  imports: [UserModule, PrismaModule, AuthModule, DoctorModule, HospitalModule, PatientProfileModule,
    AppointmentModule, PaymentModule,
    ConfigModule.forRoot({
      envFilePath: path.resolve(__dirname, '../.env'),
      isGlobal: true,
    }),],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
