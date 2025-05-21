import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { DoctorModule } from './doctor/doctor.module';
import { SpecialtyModule } from './specialty/specialty.module';
import { HospitalModule } from './hospital/hospital.module';
import { PatientProfileModule } from './patient-profile/patient-profile.module';
import { AppointmentModule } from './appointment/appointment.module';
import { FeedbackModule } from './feedback/feedback.module';
import { MedicalRecordModule } from './medical-record/medical-record.module';
import { PrescriptionItemModule } from './prescription-item/prescription-item.module';
import { DoctorScheduleModule } from './doctorSchedule/doctor-schedule.module';
import { PaymentModule } from './payment/payment.module';
import { FollowUpModule } from './follow-up/follow-up.module';
import { AchievementModule } from './achievement/achievement.module';
import { CertificationModule } from './certification/certification.module';

@Module({
  imports: [UserModule, PrismaModule, AuthModule, DoctorModule, SpecialtyModule, HospitalModule, PatientProfileModule,
    AppointmentModule, FeedbackModule, MedicalRecordModule, PrescriptionItemModule,
    DoctorScheduleModule, PaymentModule, FollowUpModule, AchievementModule, CertificationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
