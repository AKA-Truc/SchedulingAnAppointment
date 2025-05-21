import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationService {
    constructor(private readonly prisma: PrismaService) {}

    async create(dto: CreateNotificationDto) {
        const notification = await this.prisma.notification.create({
            data: {
                type: dto.type,
                method: dto.method,
                title: dto.title,
                content: dto.content,
                userId: dto.userId,
                remindAt: dto.remindAt,
                sent: dto.sent,
                targetType: dto.targetType,
                targetId: dto.targetId,
                appointmentId: dto.appointmentId,
                followUpId: dto.followUpId,
                medicalRecordId: dto.medicalRecordId,
            },
            include: {
                user: true,
                appointment: true,
                followUp: true,
                medicalRecord: true,
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
                    user: true,
                    appointment: true,
                    followUp: true,
                    medicalRecord: true,
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
            where: { id },
            include: {
                user: true,
                appointment: true,
                followUp: true,
                medicalRecord: true,
            },
        });

        if (!notification) {
            throw new NotFoundException(`Notification with ID ${id} not found`);
        }

        return notification;
    }

    async update(id: number, dto: UpdateNotificationDto) {
        const notification = await this.prisma.notification.findUnique({
            where: { id },
        });

        if (!notification) {
            throw new NotFoundException(`Notification with ID ${id} not found`);
        }

        return this.prisma.notification.update({
            where: { id },
            data: dto,
            include: {
                user: true,
                appointment: true,
                followUp: true,
                medicalRecord: true,
            },
        });
    }

    async remove(id: number) {
        const notification = await this.prisma.notification.findUnique({
            where: { id },
        });

        if (!notification) {
            throw new NotFoundException(`Notification with ID ${id} not found`);
        }

        return this.prisma.notification.delete({
            where: { id },
            include: {
                user: true,
                appointment: true,
                followUp: true,
                medicalRecord: true,
            },
        });
    }

    async markAsSent(id: number) {
        const notification = await this.prisma.notification.findUnique({
            where: { id },
        });

        if (!notification) {
            throw new NotFoundException(`Notification with ID ${id} not found`);
        }

        return this.prisma.notification.update({
            where: { id },
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
                    user: true,
                    appointment: true,
                    followUp: true,
                    medicalRecord: true,
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
