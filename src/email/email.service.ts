import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailerService } from '@nestjs-modules/mailer';
import * as Handlebars from 'handlebars';
import { AppointmentWithDetails } from 'src/appointment/type/appointment-with-details.interface';
import * as path from 'path';
import * as fs from 'fs';


@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly prisma: PrismaService,
  ) { }

  async sendAppointmentReminder(email: string, scheduledTime: string, timeLeftText: string) {
    const scheduledDate = new Date(scheduledTime).toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const templatePath = path.join(process.cwd(), 'src', 'email', 'templates', 'appointment-reminder.html');
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const template = Handlebars.compile(templateSource);

    const templateData = {
      scheduledDate: scheduledDate,
      timeLeftText: timeLeftText,
    };

    await this.mailerService.sendMail({
      to: email,
      subject: 'Nhắc lịch khám',
      html: template(templateData),
    });
  }

  async sendAppointmentConfirmationWithHandlebars(email: string, appointment: AppointmentWithDetails) {
    const scheduledTime = new Date(appointment.scheduledTime).toLocaleString('vi-VN');

    const templatePath = path.join(process.cwd(), 'src', 'email', 'templates', 'appointment-confirmation.template.html');
    const templateSource = fs.readFileSync(templatePath, 'utf8');

    const template = Handlebars.compile(templateSource);

    const templateData = {
      patientName: appointment.user.fullName,
      scheduledTime: scheduledTime,
      doctorName: appointment.doctor.user.fullName,
      specialty: appointment.doctor.specialty?.name || 'Chưa cập nhật',
      clinic: appointment.doctor.clinic || 'Chưa cập nhật',
      serviceName: appointment.service.name,
      hasNote: !!appointment.note,
      note: appointment.note
    };

    const htmlContent = template(templateData);

    await this.mailerService.sendMail({
      to: email,
      subject: 'Xác nhận đặt lịch khám bệnh',
      html: htmlContent,
    });
  }

  async sendFollowUpNoti(to: string, followUp: { appointmentId: number; nextDate: Date; reason: string }) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { appointmentId: followUp.appointmentId },
      include: {
        user: true,
        doctor: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new Error('Appointment not found for follow-up email');
    }

    const formattedDate = new Date(followUp.nextDate).toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const templatePath = path.join(process.cwd(), 'src', 'email', 'templates', 'follow-up-reminder.html');
    const templateSource = fs.readFileSync(templatePath, 'utf8');

    const template = Handlebars.compile(templateSource);

    const templateData = {
      patientName: appointment.user.fullName,
      doctorName: appointment.doctor.user.fullName,
      followUpTime: formattedDate,
      reason: followUp.reason,
    };

    const htmlContent = template(templateData);

    await this.mailerService.sendMail({
      to: to,
      subject: 'Nhắc lịch tái khám',
      html: htmlContent,
    });
  }

  async sendVerificationEmail(email: string, fullName: string, token: string) {
    const verifyUrl = `https://4da6-42-114-202-149.ngrok-free.app/auth/verify-email?token=${token}`;

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

  async sendResetCode(email: string, code: string) {
    const html = `
      <html>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f2f2f2;">
          <table role="presentation" style="width: 100%; height: 50vh; background-color: #f2f2f2; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 20px;">
                <div style="background-color: #fff; padding: 30px; max-width: 320px; width: 100%; text-align: center; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                  <h1 style="font-size: 24px; color: #333; margin-bottom: 15px;">Mã Xác Thực</h1>
                  <p>Đây là mã OTP quên mật khẩu của bạn:</p>
                  <div style="background-color: #f8f8f8; padding: 15px; font-size: 32px; letter-spacing: 5px; font-weight: bold; color: #3676CA; margin: 20px 0; user-select: none;">${code}</div>
                  <p style="font-size: 14px; color: #666; line-height: 1.5;">Nếu bạn không phải là người gửi yêu cầu này, hãy đổi mật khẩu tài khoản ngay lập tức để tránh việc bị truy cập trái phép.</p>
                </div>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Mã xác thực đặt lại mật khẩu',
      html,
    });
  }
}
