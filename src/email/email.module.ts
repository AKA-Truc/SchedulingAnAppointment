import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.EMAIL_HOST || 'smtp.example.com',
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      },
      defaults: {
        from: '"MedicalSchedule" <no-reply@medicalSchedule.com>',
      },
    }),
  ],
  exports: [MailerModule],
})
export class MailModule {}