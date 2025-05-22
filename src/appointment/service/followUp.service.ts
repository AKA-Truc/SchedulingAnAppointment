import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFollowUp, UpdateFeedback } from '../DTO';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { NotificationType } from '@prisma/client';

enum ReminderOffset {
  BEFORE_30_MINUTES = 30,
  BEFORE_1_HOUR = 60,
  BEFORE_1_DAY = 1440,
}

@Injectable()
export class FollowUpService {

    constructor(
        private prisma: PrismaService, 
        @InjectRedis() private readonly redis: Redis,
    ) {}

    async createFollowUp(dto: CreateFollowUp) {
        const appointment = await this.prisma.appointment.findUnique({
            where: { appointmentId: dto.appointmentId },
        });

        if (!appointment) {
            throw new NotFoundException('Appointment not found');
        }

        if (appointment.status !== 'COMPLETED') {
            throw new BadRequestException('Follow-up can only be created for completed appointments');
        }

        if (new Date(dto.nextDate) <= new Date()) {
            throw new BadRequestException('Next follow-up date must be in the future');
        }

        // Có thể kiểm tra trùng theo bác sĩ và thời gian tái khám
        const existingFollowUp = await this.prisma.followUp.findFirst({
            where: {
                appointment: {
                    doctorId: appointment.doctorId,
                },
                nextDate: dto.nextDate,
            },
        });

        if (existingFollowUp) {
            throw new BadRequestException('Follow-up already exists for this doctor on the same date');
        }
        
        const followUp = await this.prisma.followUp.create({
            data: {
                appointmentId: dto.appointmentId,
                nextDate: dto.nextDate,
                reason: dto.reason,
            },
        });

        const scheduledTime = new Date(dto.nextDate).getTime();

        for (const offsetMinutes of Object.values(ReminderOffset).filter(v => typeof v === 'number') as number[]) {
            const remindAtTimestamp = scheduledTime - offsetMinutes * 60 * 1000;

            if (remindAtTimestamp > Date.now()) {
                const remindAt = new Date(remindAtTimestamp);

                const dbNotification = await this.prisma.notification.create({
                    data: {
                        userId: appointment.userId,
                        appointmentId: appointment.appointmentId,
                        type: NotificationType.FOLLOW_UP,
                        title: 'Nhắc lịch tái khám',
                        content: `Bạn có lịch tái khám vào lúc ${dto.nextDate}`,
                        remindAt,
                        scheduledTime: new Date(dto.nextDate),
                    },
                });

                const redisNotification = {
                    id: dbNotification.notificationId,
                    userId: dbNotification.userId,
                    title: dbNotification.title,
                    content: dbNotification.content,
                    remindAt: dbNotification.remindAt.toISOString(),
                    type: dbNotification.type,
                    scheduledTime: dbNotification.scheduledTime.toISOString(),
                };

                await this.redis.zadd(
                    `notifications:${appointment.userId}`,
                    remindAtTimestamp,
                    JSON.stringify(redisNotification),
                );
            }
        }

        return followUp;
    }

}