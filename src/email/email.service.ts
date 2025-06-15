import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { AppointmentWithDetails } from 'src/type/appointment-with-details.interface';


@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) { }

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

  async sendAppointmentConfirmation(email: string, appointment: AppointmentWithDetails) {
    const scheduledTime = new Date(appointment.scheduledTime).toLocaleString('vi-VN');

    await this.mailerService.sendMail({
      to: email,
      subject: 'Xác nhận đặt lịch khám bệnh',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #2a9d8f;">Xác nhận đặt lịch khám thành công</h2>

          <p><strong>👤 Bệnh nhân:</strong> ${appointment.user.fullName}</p>
          <p><strong>📅 Thời gian khám:</strong> ${scheduledTime}</p>
          <p><strong>🩺 Bác sĩ:</strong> ${appointment.doctor.user.fullName}</p>
          <p><strong>🏥 Phòng khám:</strong> ${appointment.doctor.clinic || 'Chưa cập nhật'}</p>
          <p><strong>🧠 Chuyên khoa:</strong> ${appointment.doctor.specialty?.name || 'Chưa cập nhật'}</p>
          <p><strong>💼 Dịch vụ:</strong> ${appointment.service.name}</p>
          <p><strong>📝 Ghi chú:</strong> ${appointment.note || 'Không có ghi chú'}</p>

          <hr style="margin: 20px 0;" />
          <p style="font-size: 0.9em; color: #777;">Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của chúng tôi!</p>
        </div>
      `,
    });
  }

  async sendVerificationEmail(email: string, fullName: string, token: string) {
    const verifyUrl = `https://f0fb-42-113-218-160.ngrok-free.app/auth/verify-email?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Xác thực tài khoản',
      html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Xác thực địa chỉ email</h2>
        <p>Xin chào <strong>${fullName}</strong>,</p>
        <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng xác thực địa chỉ email của bạn bằng cách nhấp vào liên kết bên dưới:</p>
        <a href="${verifyUrl}" style="display: inline-block; padding: 10px 20px; background-color: #2a9d8f; color: white; text-decoration: none;">Xác thực ngay</a>
        <p>Liên kết sẽ hết hạn sau 15 phút.</p>
      </div>
    `,
    });
  }
}
