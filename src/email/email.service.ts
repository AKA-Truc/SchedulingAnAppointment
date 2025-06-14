import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { AppointmentWithDetails } from 'src/type/appointment-with-details.interface';


@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendAppointmentReminder(email: string, scheduledTime: string, timeLeftText: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Nhắc lịch khám',
      html: `
      <div style="max-width: 600px; margin: auto; padding: 0; font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8; color: #333;">

        <!-- Header -->
        <div style="background-color: #ffffff; padding: 20px 30px; border-bottom: 1px solid #e0e0e0; text-align: center;">
          <img src="https://res.cloudinary.com/dug8yah2g/image/upload/v1749878184/ic_medical_logo_yvshlb.png" alt="Clinic Logo" style="height: 100px; margin-bottom: 10px;" />
          <h1 style="margin: 0; font-size: 22px; color: #2a9d8f; font-weight: 700;">HEALTHSCHE</h1>
        </div>

        <!-- Body -->
        <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; font-family: 'Inter', sans-serif;">
          <h2 style="color: #333; font-size: 20px; font-weight: 600; margin-top: 0;">🩺 Nhắc lịch khám bệnh</h2>

          <p style="font-size: 16px; margin: 16px 0;">Xin chào,</p>
          <p style="font-size: 16px; margin: 16px 0;">
            Bạn có lịch khám vào lúc: 
            <strong style="color: #2a9d8f;">${scheduledTime}</strong>.
          </p>
          <p style="font-size: 16px; margin: 16px 0;">
            Còn <strong style="color: #e76f51;">${timeLeftText}</strong> nữa đến thời điểm khám.
          </p>

          <div style="text-align: center; margin-top: 30px;">
            <a href="https://yourdomain.com/appointments" style="
              background-color: #2a9d8f;
              color: white;
              padding: 14px 24px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              display: inline-block;
              font-size: 15px;
              font-family: 'Inter', sans-serif;
            ">📅 Xem chi tiết lịch khám</a>
          </div>

          <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;" />

          <p style="font-size: 14px; color: #666; line-height: 1.5;">
            Nếu bạn có bất kỳ thắc mắc nào, hãy liên hệ với chúng tôi qua hotline hoặc email.
          </p>
          <p style="font-size: 14px; color: #999; margin-top: 20px;">
            Trân trọng,<br/>
            Đội ngũ chăm sóc khách hàng
          </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; font-size: 12px; color: #999; padding: 20px; font-family: 'Inter', sans-serif;">
          © 2025 Phòng Khám Sức Khỏe Việt. Tất cả các quyền được bảo lưu.
        </div>
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
          <p><strong>🧠 Chuyên khoa:</strong> ${appointment.doctor.specialty?.name|| 'Chưa cập nhật'}</p>
          <p><strong>💼 Dịch vụ:</strong> ${appointment.service.name}</p>
          <p><strong>📝 Ghi chú:</strong> ${appointment.note || 'Không có ghi chú'}</p>

          <hr style="margin: 20px 0;" />
          <p style="font-size: 0.9em; color: #777;">Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của chúng tôi!</p>
        </div>
      `,
    });
  }

}
