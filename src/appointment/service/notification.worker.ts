// notification.worker.ts
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Redis } from 'ioredis';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationWorker {
  constructor(
    private readonly redis: Redis,
    private readonly prisma: PrismaService,
    private readonly gateway: NotificationGateway,
  ) {}

  @Cron('*/10 * * * * *') // Mỗi 10s
  async handleReminders() {
    const now = Date.now();
    const userKeys = await this.redis.keys('notifications:*');

    for (const key of userKeys) {
      const dueNotifs = await this.redis.zrangebyscore(key, 0, now);

      for (const raw of dueNotifs) {
        const notif = JSON.parse(raw);

        // Gửi WebSocket
        this.gateway.sendToUser(`${notif.userId}`, notif);

        // Cập nhật DB
        await this.prisma.notification.update({
          where: { notificationId: notif.notificationId },
          data: { sent: true },
        });

        // Xoá khỏi Redis
        await this.redis.zrem(key, raw);
      }
    }
  }
}
