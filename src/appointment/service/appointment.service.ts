import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailService } from 'src/email/email.service';
import { NotificationGateway } from './notification.gateway';
import { CreateAppointment, UpdateAppointment } from '../DTO';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { AppointmentStatus } from '@prisma/client';
import { NotificationType } from '@prisma/client';

enum ReminderOffset {
  BEFORE_30_MINUTES = 30,
  BEFORE_1_HOUR = 60,
  BEFORE_1_DAY = 1440,
}

function getTimeLeftText(from: Date, to: Date): string {
  const msLeft = to.getTime() - from.getTime();
  const minutesLeft = Math.floor(msLeft / (60 * 1000));
  const hoursLeft = Math.floor(minutesLeft / 60);
  const daysLeft = Math.floor(hoursLeft / 24);

  if (daysLeft > 0) return `${daysLeft} ngày`;
  if (hoursLeft > 0) return `${hoursLeft} giờ`;
  return `${minutesLeft} phút`;
}


@Injectable()
export class AppointmentService {
  constructor(
    private prisma: PrismaService,
    @InjectRedis() private readonly redis: Redis,
    private readonly emailService: EmailService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  private async scheduleNotificationsForAppointment(data: CreateAppointment, appointmentId: number) {
    const scheduledTime = new Date(data.scheduledTime).getTime();

    for (const offsetMinutes of Object.values(ReminderOffset).filter(v => typeof v === 'number') as number[]) {
        const remindAtTimestamp = scheduledTime - offsetMinutes * 60 * 1000;
        if (remindAtTimestamp <= Date.now()) continue;

        const remindAt = new Date(remindAtTimestamp);
        const timeLeftText = getTimeLeftText(remindAt, new Date(scheduledTime));

        const dbNotification = await this.prisma.notification.create({
        data: {
            userId: data.userId,
            appointmentId,
            type: NotificationType.APPOINTMENT,
            title: 'Nhắc lịch khám',
            content: `Bạn có lịch khám vào lúc ${data.scheduledTime} (còn ${timeLeftText} nữa)`,
            remindAt,
            scheduledTime: new Date(data.scheduledTime),
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
        `notifications:${data.userId}`,
        remindAtTimestamp,
        JSON.stringify(redisNotification),
        );
    }
    }


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
            serviceId: data.serviceId,
            scheduledTime: data.scheduledTime,
            note: data.note,
            status: 'SCHEDULED',
            },
        });

        await this.scheduleNotificationsForAppointment(data, appointment.appointmentId);

        const user = await this.prisma.user.findUnique({
            where: { userId: data.userId },
            select: { email: true },
        });

        this.notificationGateway.sendToUser(data.userId, {
            type: 'APPOINTMENT_CREATED',
            appointmentId: appointment.appointmentId,
            scheduledTime: data.scheduledTime,
        });

        if (user?.email) {
            const timeLeftText = getTimeLeftText(new Date(), new Date(data.scheduledTime));
            await this.emailService.sendAppointmentReminder(user.email, data.scheduledTime, timeLeftText);
        }

        return appointment;
    }


    async getAllAppointments(page: number, limit: number) {
        const total = await this.prisma.appointment.count();
        const skip = (page - 1) * limit;
        const appointments = await this.prisma.appointment.findMany({
            skip,
            take: limit,
            include: {
                doctor: true,
                user: true,
                feedback: true,
                followUps: true,
                payments: true,
            },
        });
        return {
            data: appointments,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getAppointmentById(id: number) {
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

        // const userId = req.user?.userId; // lấy userId từ req

        // if (appointment.userId !== userId) {
        //     throw new ForbiddenException('Bạn không có quyền truy cập vào lịch hẹn này');
        // }

        return appointment;
    }

    async updateStatus(id: number, status: AppointmentStatus) {
        const appointment = await this.prisma.appointment.findUnique({
            where: { appointmentId: id },
        });

        if (!appointment) {
            throw new NotFoundException(`Appointment ID ${id} không tồn tại`);
        }

        return this.prisma.appointment.update({
            where: { appointmentId: id },
            data: { status },
        });
    }


    async updateAppointment(id: number, dto: UpdateAppointment) {
        const appointment = await this.prisma.appointment.findUnique({
            where: { appointmentId: id },
        });

        if (!appointment) {
            throw new NotFoundException(`Lịch hẹn ID ${id} không tồn tại`);
        }

        //Không cho chỉnh sửa nếu lịch đã hoàn thành hoặc bị hủy
        if (appointment.status === 'COMPLETED' || appointment.status === 'CANCELLED') {
            throw new BadRequestException('Không thể cập nhật lịch hẹn đã hoàn thành hoặc bị hủy');
        }

        delete dto.userId;
        delete dto.doctorId;

        return this.prisma.appointment.update({
            where: { appointmentId: id },
            data: dto,
        });
    }


    async cancelAppointment(id: number, reason?: string) {
        const appointment = await this.prisma.appointment.findUnique({
            where: { appointmentId: id },
                include: { notifications: true },
            });

            if (!appointment) {
                throw new NotFoundException(`Lịch hẹn ID ${id} không tồn tại`);
            }

            if (appointment.status === 'COMPLETED') {
                throw new BadRequestException('Không thể hủy lịch hẹn đã hoàn thành');
            }

            if (appointment.status === 'CANCELLED') {
                throw new BadRequestException('Lịch hẹn đã bị hủy trước đó');
            }

            //Cập nhật trạng thái lịch hẹn
            await this.prisma.appointment.update({
                where: { appointmentId: id },
                data: {
                    status: 'CANCELLED'
                },
            });

            //Xóa notification trong DB
            const notifications = await this.prisma.notification.findMany({
                where: {
                    scheduledTime: appointment.scheduledTime,
                    userId: appointment.userId,
                    type: 'APPOINTMENT',
                },
            });

            for (const notify of notifications) {
                // Xoá Redis
                await this.redis.zrem(
                    `notifications:${notify.userId}`,
                    JSON.stringify({
                        id: notify.notificationId,
                        userId: notify.userId,
                        title: notify.title,
                        content: notify.content,
                        remindAt: notify.remindAt.toISOString(),
                        type: notify.type,
                        scheduledTime: notify.scheduledTime.toISOString(),
                    })
                );

                //Xoá DB
                await this.prisma.notification.delete({
                    where: { notificationId: notify.notificationId },
                });
            }
        return { message: 'Hủy lịch hẹn và xoá thông báo thành công' };
    }
}
