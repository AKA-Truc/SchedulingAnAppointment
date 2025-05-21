import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDoctorSchedule, UpdateDoctorSchedule } from './DTO';

@Injectable()
export class DoctorScheduleService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateDoctorSchedule) {
        const schedule = await this.prisma.doctorSchedule.create({
            data: {
                doctorId: dto.doctorId,
                dayOfWeek: dto.dayOfWeek,
                startTime: dto.startTime,
                endTime: dto.endTime,
            },
        });

        return {
            message: 'Lịch làm việc bác sĩ đã được tạo thành công',
            schedule,
        };
    }

    async findAll(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [schedules, total] = await Promise.all([
            this.prisma.doctorSchedule.findMany({
                skip,
                take: limit,
                include: { doctor: true },
            }),
            this.prisma.doctorSchedule.count(),
        ]);
        return {
            data: schedules,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: number) {
        const schedule = await this.prisma.doctorSchedule.findUnique({
            where: { scheduleId: id },
            include: { doctor: true },
        });
        if (!schedule) {
            throw new NotFoundException(`Không tìm thấy lịch làm việc với ID ${id}`);
        }
        return schedule;
    }

    async update(id: number, dto: UpdateDoctorSchedule) {
        const schedule = await this.prisma.doctorSchedule.findUnique({
            where: { scheduleId: id },
        });
        if (!schedule) {
            throw new NotFoundException(`Không tìm thấy lịch làm việc với ID ${id}`);
        }
        return this.prisma.doctorSchedule.update({
            where: { scheduleId: id },
            data: { ...dto },
        });
    }

    async remove(id: number) {
        const schedule = await this.prisma.doctorSchedule.findUnique({
            where: { scheduleId: id },
        });
        if (!schedule) {
            throw new NotFoundException(`Không tìm thấy lịch làm việc với ID ${id}`);
        }
        return this.prisma.doctorSchedule.delete({
            where: { scheduleId: id },
        });
    }
}
