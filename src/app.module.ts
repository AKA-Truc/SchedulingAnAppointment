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

@Module({
  imports: [UserModule, PrismaModule, AuthModule, DoctorModule, HospitalModule, PatientProfileModule,
    AppointmentModule, PaymentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
