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

  @Cron('*/30 * * * * *') // Every 30 seconds (reduced from 10s)
  async handleReminders() {
    const now = Date.now();
    console.log(`[Worker] Cron started at ${new Date(now).toISOString()}`);

    const userKeys = await this.redis.keys('notifications:*');
    console.log(`[Worker] Found ${userKeys.length} notification keys in Redis`);

    if (userKeys.length === 0) {
      console.log(`[Worker] No notification keys found, ending cron job early`);
      return;
    }

    let totalProcessed = 0;
    for (const key of userKeys) {
      const dueNotifs = await this.redis.zrangebyscore(key, 0, now);
      
      if (dueNotifs.length === 0) {
        continue; // Skip keys with no due notifications
      }

      console.log(`[Worker] Found ${dueNotifs.length} due notifications in ${key}`);

      for (const raw of dueNotifs) {
        let notif: any;
        try {
          notif = JSON.parse(raw);
        } catch (error) {
          console.error(`[Worker] Failed to parse JSON for key ${key}:`, error);
          // Remove invalid JSON from Redis
          await this.redis.zrem(key, raw);
          continue;
        }

        // Validate notification before processing
        if (!notif.id || !notif.userId || !notif.title) {
          console.warn(`[Worker] Invalid notification structure:`, notif);
          await this.redis.zrem(key, raw);
          continue;
        }

        console.log(`[Worker] Processing notif ID: ${notif.id}, userId: ${notif.userId}, title: "${notif.title}"`);

        // Check if notification was already sent (safety check)
        try {
          const dbNotif = await this.prisma.notification.findUnique({
            where: { notificationId: notif.id },
            select: { sent: true }
          });

          if (dbNotif?.sent) {
            console.log(`[Worker] Notification ${notif.id} already marked as sent, removing from Redis`);
            await this.redis.zrem(key, raw);
            continue;
          }
        } catch (error) {
          console.error(`[Worker] Failed to check notification status for ID ${notif.id}:`, error);
        }

        // Send WebSocket notification
        try {
          this.gateway.sendToUser(`${notif.userId}`, notif);
          console.log(`[Worker] ✅ Sent WebSocket notif to user ${notif.userId}`);
        } catch (error) {
          console.error(`[Worker] ❌ Failed to send WebSocket to user ${notif.userId}:`, error);
          continue;
        }

        // Gửi email
        try {
          const user = await this.prisma.user.findUnique({
            where: { userId: notif.userId },
            select: { email: true },
          });

          if (user?.email) {
            const scheduledTime = new Date(notif.scheduledTime);
            const timeLeftText = this.getTimeLeftText(new Date(), scheduledTime);

            await this.emailService.sendAppointmentReminder(
              user.email,
              scheduledTime.toISOString(),
              timeLeftText,
            );

            console.log(`[Worker] Sent email to ${user.email} for notif ID ${notif.id}`);
          } else {
            console.warn(`[Worker] No email found for user ${notif.userId}`);
          }
        } catch (error) {
          console.error(`[Worker] Failed to send email for notif ID ${notif.id}:`, error);
          continue;
        }

        // Update database to mark as sent
        try {
          await this.prisma.notification.update({
            where: { notificationId: notif.id },
            data: { sent: true },
          });
          console.log(`[Worker] ✅ Updated DB: notif ID ${notif.id} marked as sent`);
        } catch (error) {
          console.error(`[Worker] ❌ Failed to update DB for notif ID ${notif.id}:`, error);
        }

        // Remove from Redis after successful processing
        try {
          await this.redis.zrem(key, raw);
          console.log(`[Worker] ✅ Removed notif ID ${notif.id} from Redis`);
          totalProcessed++;
        } catch (error) {
          console.error(`[Worker] ❌ Failed to remove notif ID ${notif.id} from Redis:`, error);
        }
      }
    }

    console.log(`[Worker] 🎯 Cron finished - Processed ${totalProcessed} notifications\n`);
  }
}
