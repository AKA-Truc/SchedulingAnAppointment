import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateNotificationDto) {
        const notification = await this.prisma.notification.create({
            data: {
                type: dto.type,
                title: dto.title,
                content: dto.content,
                userId: dto.userId,
                appointmentId: dto.appointmentId,
                remindAt: dto.remindAt,
                sent: dto.sent,
                scheduledTime: dto.scheduledTime,

            },
            include: {
                user: true,
            },
        });

        return {
            message: 'Notification created successfully',
            notification,
        };
    }

    async findAll(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [notifications, total] = await Promise.all([
            this.prisma.notification.findMany({
                skip,
                take: limit,
                include: {
                    user: true
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            this.prisma.notification.count(),
        ]);

        return {
            data: notifications,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: number) {
        const notification = await this.prisma.notification.findUnique({
            where: { notificationId: id },
            include: {
                user: true
            },
        });

        if (!notification) {
            throw new NotFoundException(`Notification with ID ${id} not found`);
        }

        return notification;
    }

    async update(id: number, dto: UpdateNotificationDto) {
        const notification = await this.prisma.notification.findUnique({
            where: { notificationId: id },
        });

        if (!notification) {
            throw new NotFoundException(`Notification with ID ${id} not found`);
        }

        return this.prisma.notification.update({
            where: { notificationId: id },
            data: dto,
            include: {
                user: true
            },
        });
    }

    async remove(id: number) {
        const notification = await this.prisma.notification.findUnique({
            where: { notificationId: id },
        });

        if (!notification) {
            throw new NotFoundException(`Notification with ID ${id} not found`);
        }

        return this.prisma.notification.delete({
            where: { notificationId: id },
            include: {
                user: true
            },
        });
    }

    async markAsSent(id: number) {
        const notification = await this.prisma.notification.findUnique({
            where: { notificationId: id },
        });

        if (!notification) {
            throw new NotFoundException(`Notification with ID ${id} not found`);
        }

        return this.prisma.notification.update({
            where: { notificationId: id },
            data: { sent: true },
        });
    }

    async findByUser(userId: number, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [notifications, total] = await Promise.all([
            this.prisma.notification.findMany({
                where: { userId },
                skip,
                take: limit,
                include: {
                    user: true
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            this.prisma.notification.count({ where: { userId } }),
        ]);

        return {
            data: notifications,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}
