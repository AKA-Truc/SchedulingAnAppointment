import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAppointment, UpdateAppointment } from './DTO';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';

enum ReminderOffset {
  BEFORE_30_MINUTES = 30,
  BEFORE_1_HOUR = 60,
  BEFORE_1_DAY = 1440,
}

@Injectable()
export class AppointmentService {
  constructor(
    private prisma: PrismaService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

    async create(data: CreateAppointment) {
        const conflict = await this.prisma.appointment.findFirst({
            where: {
                doctorId: data.doctorId,
                scheduledTime: data.scheduledTime,
            },
        });
            if (conflict) {
            throw new BadRequestException('Doctor already has an appointment at this time');
        }

        const appointment = await this.prisma.appointment.create({
            data: {
                doctorId: data.doctorId,
                userId: data.userId,
                scheduledTime: data.scheduledTime,
                note: data.note,
                status: 'SCHEDULED',
            },
        });

        const scheduledTime = new Date(data.scheduledTime).getTime();

        for (const offsetMinutes of Object.values(ReminderOffset).keys()) {
            const remindAtTimestamp = scheduledTime - offsetMinutes * 60 * 1000;

            if (remindAtTimestamp > Date.now()) {
                const remindAt = new Date(remindAtTimestamp);

                // Create a notification in the database
                const dbNotification = await this.prisma.notification.create({
                data: {
                    userId: data.userId,
                    type: 'APPOINTMENT',
                    title: 'Nhắc lịch khám',
                    content: `Bạn có lịch khám vào lúc ${data.scheduledTime}`,
                    remindAt,
                    scheduledTime: new Date(data.scheduledTime),
                },
                });

                // Add the notification to Redis sorted set
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
                `notifications:${data.userId}`,
                remindAtTimestamp,
                JSON.stringify(redisNotification),
                );
            }
        }

        return appointment;

    }


    async findAll() {
        return this.prisma.appointment.findMany({
            include: {
                doctor: true,
                user: true,
                feedback: true,
                followUps: true,
                payments: true,
            },
        });
    }

    async findOne(id: number) {
        const appointment = await this.prisma.appointment.findUnique({
            where: { appointmentId: id },
            include: {
                doctor: true,
                user: true,
                feedback: true,
                followUps: true,
                payments: true,
            },
        });

        if (!appointment) {
            throw new NotFoundException(`Appointment ID ${id} không tồn tại`);
        }

        return appointment;
    }

    async update(id: number, dto: UpdateAppointment) {
        await this.findOne(id); // Kiểm tra tồn tại

        return this.prisma.appointment.update({
            where: { appointmentId: id },
            data: dto,
        });
    }

    async remove(id: number) {
        await this.findOne(id); // Kiểm tra tồn tại

        return this.prisma.appointment.delete({
            where: { appointmentId: id },
        });
    }
}
