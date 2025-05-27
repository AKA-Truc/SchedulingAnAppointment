import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDoctor, UpdateDoctor } from '../DTO';
import { DoctorScheduleService } from './doctorSchedule.service';

@Injectable()
export class DoctorService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly doctorScheduleService: DoctorScheduleService
    ) { }

    // Create doctor
    async createDoctor(data: CreateDoctor) {
        // Kiểm tra userId đã có bác sĩ chưa (do userId là unique)
        const existingDoctor = await this.prisma.doctor.findUnique({
            where: { userId: data.userId },
        });
        if (existingDoctor) {
            throw new BadRequestException(`Doctor with userId ${data.userId} already exists.`);
        }

        //Kiểm tra Specialty_ID tồn tại
        const specialty = await this.prisma.specialty.findUnique({
            where: { specialtyId: data.specialtyId },
        });
        if (!specialty) {
            throw new BadRequestException(`Specialty with ID ${data.specialtyId} does not exist.`);
        }

        //Kiểm tra hospitalId tồn tại
        const hospital = await this.prisma.hospital.findUnique({
            where: { hospitalId: data.hospitalId },
        });
        if (!hospital) {
            throw new BadRequestException(`Hospital with ID ${data.hospitalId} does not exist.`);
        }

        const doctor = await this.prisma.doctor.create({
            data: {
                userId: data.userId,
                specialtyId: data.specialtyId,
                hospitalId: data.hospitalId,
                rating: null,
                bio: null,
                yearsOfExperience: null,
                education: null,
            },
        });

        const schedule = await this.doctorScheduleService.generateDefaultSchedule(doctor.doctorId);

        return {
            message: 'Doctor created successfully.',
            doctor,
            schedule,
        };
    }

    // Get all doctors, có phân trang
    async getAllDoctors(page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const [doctors, total] = await Promise.all([
            this.prisma.doctor.findMany({
                skip,
                take: limit,
                include: {
                    user: true,
                    specialty: true,
                    hospital: true,
                    schedules: true,
                    appointments: true,
                    achievements: true
                },
            }),
            this.prisma.doctor.count(),
        ]);

        return {
            data: doctors,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    // Get doctor by id
    async getDoctorById(id: number) {
        const doctor = await this.prisma.doctor.findUnique({
            where: { doctorId: id },
            include: {
                user: true,
                specialty: true,
                hospital: true,
                schedules: true,
                appointments: true,
                achievements: true
            },
        });

        if (!doctor) {
            throw new NotFoundException(`Doctor with ID ${id} not found`);
        }

        return doctor;
    }

    // Update doctor
    async updateDoctor(id: number, dto: UpdateDoctor) {
        const doctor = await this.prisma.doctor.findUnique({
            where: { doctorId: id },
        });

        if (!doctor) {
            throw new NotFoundException(`Doctor with ID ${id} not found`);
        }

        // Nếu update userId, kiểm tra đã tồn tại chưa
        if (dto.userId && dto.userId !== doctor.userId) {
            const userIdTaken = await this.prisma.doctor.findUnique({
                where: { userId: dto.userId },
            });
            if (userIdTaken) {
                throw new BadRequestException(`Doctor with userId ${dto.userId} already exists.`);
            }
        }

        // Nếu update Specialty_ID, kiểm tra có tồn tại không
        if (dto.specialtyId) {
            const specialty = await this.prisma.specialty.findUnique({
                where: { specialtyId: dto.specialtyId },
            });
            if (!specialty) {
                throw new BadRequestException(`Specialty with ID ${dto.specialtyId} does not exist.`);
            }
        }

        // Nếu update hospitalId, kiểm tra có tồn tại không
        if (dto.hospitalId) {
            const hospital = await this.prisma.hospital.findUnique({
                where: { hospitalId: dto.hospitalId },
            });
            if (!hospital) {
                throw new BadRequestException(`Hospital with ID ${dto.hospitalId} does not exist.`);
            }
        }

        // Chuẩn bị object data để cập nhật
        const updateData: any = {};

        if (dto.userId) updateData.userId = dto.userId;
        if (dto.specialtyId) updateData.Specialty_ID = dto.specialtyId;
        if (dto.hospitalId) updateData.hospitalId = dto.hospitalId;
        if (dto.rating !== undefined) updateData.Rating = dto.rating;
        if (dto.bio !== undefined) updateData.Bio = dto.bio;
        if (dto.yearsOfExperience !== undefined) updateData.yearsOfExperience = dto.yearsOfExperience;

        const updatedDoctor = await this.prisma.doctor.update({
            where: { doctorId: id },
            data: updateData,
            include: {
                achievements: true
            }
        });

        return {
            message: 'Doctor updated successfully.',
            doctor: updatedDoctor
        };
    }


    // Delete doctor
    async deleteDoctor(id: number) {
        const doctor = await this.prisma.doctor.findUnique({
            where: { doctorId: id },
        });

        if (!doctor) {
            throw new NotFoundException(`Doctor with ID ${id} not found`);
        }

        return this.prisma.doctor.delete({
            where: { doctorId: id },
            include: {
                achievements: true
            }
        });
    }


    async getDoctorPerformanceCurrentMonth(id: number) {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth(); // 0-based, 0 = Jan

        const startDate = new Date(year, month, 1, 0, 0, 0);
        const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

        // Lấy tổng số appointment trong tháng hiện tại
        const appointmentCount = await this.prisma.appointment.count({
            where: {
                doctorId: id,
                scheduledTime: {
                    // gte: greater than or equal — lớn hơn hoặc bằng

                    // lte: less than or equal — nhỏ hơn hoặc bằng
                    gte: startDate,
                    lte: endDate,
                },
            },
        });

        // Lấy feedback trong tháng hiện tại
        const feedbacks = await this.prisma.feedback.findMany({
            where: {
                appointment: {
                    doctorId: id,
                },
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: {
                rating: true,
            },
        });

        const countFeedBack = feedbacks.length;

        // Tính rating trung bình
        let avgRating;
        let sum = 0;
        if (feedbacks.length > 0) {
            for (const fb of feedbacks) {
                sum += fb.rating;
            }
            avgRating = parseFloat((sum / feedbacks.length).toFixed(2));
        } else {
            avgRating = null;
        }

        return {
            appointmentCount,
            avgRating,
            countFeedBack,
        };
    }

    //filtering trên list doctors Theo rating, specialty, hospital
    async filterDoctors(
        params: {
            specialtyId?: number;
            minRating?: number;
            hospitalId?: number;
            page?: number;
            limit?: number;
        }
    ) {
        const { specialtyId, minRating, hospitalId, page = 1, limit = 10 } = params;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (specialtyId) where.specialtyId = +specialtyId;
        if (hospitalId) where.hospitalId = +hospitalId;
        if (minRating) where.rating = { gte: +minRating };

        const [doctors, total] = await Promise.all([
            this.prisma.doctor.findMany({
                where,
                skip,
                take: limit,
                include: {
                    user: true,
                    specialty: true,
                    hospital: true,
                    schedules: true,
                    appointments: true,
                    achievements: true,
                },
            }),
            this.prisma.doctor.count({ where }),
        ]);

        return {
            data: doctors,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

}