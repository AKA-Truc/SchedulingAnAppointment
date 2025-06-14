import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDoctorSchedule, UpdateDoctorSchedule } from '../DTO';

@Injectable()
export class DoctorScheduleService {
    constructor(private readonly prisma: PrismaService) { }

    // ✅ Kiểm tra bác sĩ có tồn tại không
    private async ensureDoctorExists(doctorId: number) {
        const doctor = await this.prisma.doctor.findUnique({ where: { doctorId } });
        if (!doctor) {
            throw new BadRequestException(`Doctor with ID ${doctorId} does not exist.`);
        }
    }

    // ✅ Kiểm tra thời gian bắt đầu phải trước thời gian kết thúc
    private validateTime(startTime: string, endTime: string) {
        if (startTime >= endTime) {
            throw new BadRequestException('Start time must be before end time.');
        }
    }

    // ✅ Tạo mới lịch làm việc cho bác sĩ
    async create(dto: CreateDoctorSchedule) {
        await this.ensureDoctorExists(dto.doctorId);
        this.validateTime(dto.startTime, dto.endTime);

        const schedule = await this.prisma.doctorSchedule.create({
            data: {
                doctorId: dto.doctorId,
                dayOfWeek: dto.dayOfWeek,
                startTime: dto.startTime,
                endTime: dto.endTime,
            },
        });

        return {
            message: 'Doctor schedule created successfully.',
            schedule,
        };
    }

    // ✅ Tạo lịch làm việc mặc định từ Thứ 2 đến Thứ 7
    async generateDefaultSchedule(doctorId: number) {
        await this.ensureDoctorExists(doctorId);

        const defaultStartTime = '08:00';
        const defaultEndTime = '17:00';
        const workingDays = [1, 2, 3, 4, 5, 6]; // Thứ 2 đến Thứ 7

        await Promise.all(
            workingDays.map(async (dayOfWeek) => {
                const exists = await this.prisma.doctorSchedule.findFirst({
                    where: { doctorId, dayOfWeek },
                });

                if (!exists) {
                    await this.prisma.doctorSchedule.create({
                        data: {
                            doctorId,
                            dayOfWeek,
                            startTime: defaultStartTime,
                            endTime: defaultEndTime,
                        },
                    });
                }
            }),
        );

        return {
            message: 'Default schedule from Monday to Saturday has been created.',
        };
    }

    // ✅ Lấy danh sách lịch làm việc (có phân trang)
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

    // ✅ Lấy chi tiết lịch làm việc theo ID
    async findOne(id: number) {
        const schedule = await this.prisma.doctorSchedule.findUnique({
            where: { scheduleId: id },
            include: { doctor: true },
        });

        if (!schedule) {
            throw new NotFoundException(`Schedule with ID ${id} not found.`);
        }

        return schedule;
    }

    // ✅ Cập nhật lịch làm việc
    async update(id: number, dto: UpdateDoctorSchedule) {
        const existing = await this.prisma.doctorSchedule.findUnique({
            where: { scheduleId: id },
        });

        if (!existing) {
            throw new NotFoundException(`Schedule with ID ${id} not found.`);
        }

        if (dto.doctorId) {
            await this.ensureDoctorExists(dto.doctorId);
        }

        if (dto.startTime && dto.endTime) {
            this.validateTime(dto.startTime, dto.endTime);
        }

        const updated = await this.prisma.doctorSchedule.update({
            where: { scheduleId: id },
            data: dto,
        });

        return {
            message: 'Doctor schedule updated successfully.',
            schedule: updated,
        };
    }

    // ✅ Xóa lịch làm việc
    async remove(id: number) {
        const schedule = await this.prisma.doctorSchedule.findUnique({
            where: { scheduleId: id },
        });

        if (!schedule) {
            throw new NotFoundException(`Schedule with ID ${id} not found.`);
        }

        await this.prisma.doctorSchedule.delete({
            where: { scheduleId: id },
        });

        return {
            message: 'Doctor schedule deleted successfully.',
        };
    }
}
