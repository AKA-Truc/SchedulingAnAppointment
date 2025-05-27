import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDoctorSchedule, UpdateDoctorSchedule } from '../DTO';

@Injectable()
export class DoctorScheduleService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateDoctorSchedule) {
        // Kiểm tra xem bác sĩ có tồn tại không
        const doctor = await this.prisma.doctor.findUnique({
            where: { doctorId: dto.doctorId },
        });
        if (!doctor) {
            throw new BadRequestException(`Bác sĩ với ID ${dto.doctorId} không tồn tại.`);
        }

        // Kiểm tra thời gian bắt đầu phải trước thời gian kết thúc
        if (dto.startTime >= dto.endTime) {
            throw new BadRequestException('Thời gian bắt đầu phải trước thời gian kết thúc.');
        }

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

    async generateDefaultSchedule(doctorId: number) {
        const doctor = await this.prisma.doctor.findUnique({
            where: { doctorId },
        });

        if (!doctor) {
            throw new BadRequestException(`Bác sĩ với ID ${doctorId} không tồn tại.`);
        }

        const defaultStartTime = '08:00';
        const defaultEndTime = '17:00';
        const workingDays = [1, 2, 3, 4, 5, 6]; // Thứ 2 đến Thứ 7


        for (const dayOfWeek of workingDays) {
            const existing = await this.prisma.doctorSchedule.findFirst({
                where: { doctorId, dayOfWeek },
            });

            if (!existing) {
                const schedule = await this.prisma.doctorSchedule.create({
                    data: {
                        doctorId: doctorId,
                        dayOfWeek: dayOfWeek,
                        startTime: defaultStartTime,
                        endTime: defaultEndTime,
                    },
                });
            }
        }

        return {
            message: 'Lịch làm việc mặc định từ Thứ 2 đến Thứ 7 đã được tạo.',
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

        // Nếu có thay đổi bác sĩ, kiểm tra bác sĩ đó có tồn tại không
        if (dto.doctorId) {
            const doctor = await this.prisma.doctor.findUnique({
                where: { doctorId: dto.doctorId },
            });
            if (!doctor) {
                throw new BadRequestException(`Bác sĩ với ID ${dto.doctorId} không tồn tại.`);
            }
        }

        // Kiểm tra thời gian nếu có cập nhật
        if (dto.startTime && dto.endTime && dto.startTime >= dto.endTime) {
            throw new BadRequestException('Thời gian bắt đầu phải trước thời gian kết thúc.');
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
