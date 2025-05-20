import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDoctorLeave, UpdateDoctorLeave } from './DTO';

@Injectable()
export class DoctorLeaveService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateDoctorLeave) {
        const leave = await this.prisma.doctorLeave.create({
            data: {
                doctor_ID: dto.doctor_ID,
                startDate: new Date(dto.startDate),
                endDate: new Date(dto.endDate),
                reason: dto.reason,
            },
        });

        return {
            message: 'Lịch nghỉ bác sĩ đã được tạo thành công',
            leave,
        };
    }

    async findAll(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [leaves, total] = await Promise.all([
            this.prisma.doctorLeave.findMany({
                skip,
                take: limit,
                include: { doctor: true },
            }),
            this.prisma.doctorLeave.count(),
        ]);
        return {
            data: leaves,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: number) {
        const leave = await this.prisma.doctorLeave.findUnique({
            where: { leave_ID: id },
            include: { doctor: true },
        });

        if (!leave) {
            throw new NotFoundException(`Không tìm thấy lịch nghỉ với ID ${id}`);
        }
        return leave;
    }

    async update(id: number, dto: UpdateDoctorLeave) {
        const leave = await this.prisma.doctorLeave.findUnique({
            where: { leave_ID: id },
        });

        if (!leave) {
            throw new NotFoundException(`Không tìm thấy lịch nghỉ với ID ${id}`);
        }

        return this.prisma.doctorLeave.update({
            where: { leave_ID: id },
            data: {
                ...dto,
                startDate: dto.startDate ? new Date(dto.startDate) : undefined,
                endDate: dto.endDate ? new Date(dto.endDate) : undefined,
            },
        });
    }

    async remove(id: number) {
        const leave = await this.prisma.doctorLeave.findUnique({
            where: { leave_ID: id },
        });

        if (!leave) {
            throw new NotFoundException(`Không tìm thấy lịch nghỉ với ID ${id}`);
        }

        return this.prisma.doctorLeave.delete({
            where: { leave_ID: id },
        });
    }
}
