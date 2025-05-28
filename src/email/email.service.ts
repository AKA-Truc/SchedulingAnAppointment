import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendAppointmentReminder(email: string, scheduledTime: string, timeLeftText: string) {
        await this.mailerService.sendMail({
            to: email,
            subject: 'Nhắc lịch khám',
            html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
                <h2 style="color: #2a9d8f;">Nhắc lịch khám</h2>
                <p>Bạn có lịch khám vào lúc <strong>${scheduledTime}</strong></p>
                <p>Còn <strong style="color: #e76f51;">${timeLeftText}</strong> nữa.</p>
                <hr />
                <p style="font-size: 0.9em; color: #777;">
                Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!
                </p>
            </div>
            `,
        });
    }
}
