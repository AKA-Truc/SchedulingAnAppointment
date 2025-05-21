import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFollowUp, UpdateFollowUp } from './DTO';

@Injectable()
export class FollowUpService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateFollowUp) {
        const followUp = await this.prisma.followUp.create({
            data: {
                appointmentId: dto.appointmentId,
                nextDate: new Date(dto.nextDate),
                reason: dto.reason,
            },
        });

        return {
            message: 'Tạo lịch tái khám thành công',
            followUp,
        };
    }

    async findAll(page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.prisma.followUp.findMany({
                skip,
                take: limit,
                include: { appointment: true },
            }),
            this.prisma.followUp.count(),
        ]);

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: number) {
        const followUp = await this.prisma.followUp.findUnique({
            where: { followUpId: id },
            include: { appointment: true },
        });

        if (!followUp) {
            throw new NotFoundException(`Không tìm thấy follow-up với ID ${id}`);
        }

        return followUp;
    }

    async update(id: number, dto: UpdateFollowUp) {
        const existing = await this.prisma.followUp.findUnique({
            where: { followUpId: id },
        });

        if (!existing) {
            throw new NotFoundException(`Không tìm thấy follow-up với ID ${id}`);
        }

        return this.prisma.followUp.update({
            where: { followUpId: id },
            data: {
                ...dto,
                nextDate: dto.nextDate ? new Date(dto.nextDate) : undefined,
            },
        });
    }

    async remove(id: number) {
        const existing = await this.prisma.followUp.findUnique({
            where: { followUpId: id },
        });

        if (!existing) {
            throw new NotFoundException(`Không tìm thấy follow-up với ID ${id}`);
        }

        return this.prisma.followUp.delete({
            where: { followUpId: id },
        });
    }
}
