import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Redis } from 'ioredis';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationGateway } from './notification.gateway';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class NotificationWorker {
  constructor(
    private readonly redis: Redis,
    private readonly prisma: PrismaService,
    private readonly gateway: NotificationGateway,
    private readonly emailService: EmailService,
  ) {}

  private getTimeLeftText(from: Date, to: Date): string {
    const msLeft = to.getTime() - from.getTime();
    const minutesLeft = Math.floor(msLeft / (60 * 1000));
    const hoursLeft = Math.floor(minutesLeft / 60);
    const daysLeft = Math.floor(hoursLeft / 24);

    if (daysLeft > 0) return `${daysLeft} ngày`;
    if (hoursLeft > 0) return `${hoursLeft} giờ`;
    return `${minutesLeft} phút`;
  }

  @Cron('*/10 * * * * *') // Mỗi 10s
  async handleReminders() {
    const now = Date.now();
    const userKeys = await this.redis.keys('notifications:*');

    for (const key of userKeys) {
      const dueNotifs = await this.redis.zrangebyscore(key, 0, now);

      for (const raw of dueNotifs) {
        const notif = JSON.parse(raw);

        try {
          // Gửi WebSocket
          this.gateway.sendToUser(`${notif.userId}`, notif);
        } catch (error) {
          console.error('Failed to send notification via WebSocket:', error);
          continue;
        }

        try {
          // Lấy email người dùng
          const user = await this.prisma.user.findUnique({
            where: { userId: notif.userId },
            select: { email: true },
          });

          if (user?.email) {
            // Gửi email nhắc hẹn
            const scheduledTime = new Date(notif.scheduledTime);
            const timeLeftText = this.getTimeLeftText(new Date(), scheduledTime);
            await this.emailService.sendAppointmentReminder(user.email, scheduledTime.toISOString(), timeLeftText);
          }
        } catch (error) {
          console.error('Failed to send reminder email:', error);
          continue;
        }

        try {
          // Cập nhật DB
          await this.prisma.notification.update({
            where: { notificationId: notif.id },
            data: { sent: true },
          });
        } catch (error) {
          console.error('Failed to update notification in DB:', error);
        }

        // Xoá khỏi Redis
        await this.redis.zrem(key, raw);
      }
    }
  }
}

