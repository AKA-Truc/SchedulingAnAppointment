import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDoctor, UpdateDoctor } from '../DTO';
import { DoctorScheduleService } from './doctorSchedule.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class DoctorService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly doctorScheduleService: DoctorScheduleService,
        private readonly userService: UserService,
    ) { }

    // 🟢 Tạo bác sĩ mới
    async createDoctor(data: CreateDoctor) {

        const newUser = await this.userService.createUser(data.user)

        // Kiểm tra userId đã có bác sĩ chưa
        const existingDoctor = await this.prisma.doctor.findUnique({
            where: { userId: newUser.userId },
        });
        if (existingDoctor) {
            throw new BadRequestException(`Doctor with userId ${newUser.userId} already exists.`);
        }

        // Kiểm tra specialtyId
        const specialty = await this.prisma.specialty.findUnique({
            where: { specialtyId: data.specialtyId },
        });
        if (!specialty) {
            throw new BadRequestException(`Specialty with ID ${data.specialtyId} does not exist.`);
        }

        // Kiểm tra hospitalId
        const hospital = await this.prisma.hospital.findUnique({
            where: { hospitalId: data.hospitalId },
        });
        if (!hospital) {
            throw new BadRequestException(`Hospital with ID ${data.hospitalId} does not exist.`);
        }

        const doctor = await this.prisma.doctor.create({
            data: {
                userId: newUser.userId,
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

    // 📄 Lấy danh sách bác sĩ (có phân trang)
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
                    achievements: true,
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

    //Get all dotors by specialtyId
    async getDoctors({
        specialtyId,
        page,
        limit,
    }: {
        specialtyId?: number;
        page: number;
        limit: number;
    }) {
        const skip = (page - 1) * limit;

        const where = specialtyId ? { specialtyId } : {};

        const [doctors, totalCount] = await this.prisma.$transaction([
            this.prisma.doctor.findMany({
                where,
                skip,
                take: limit,
                select: {
                    doctorId: true,
                    rating: true,
                    bio: true,
                    yearsOfExperience: true,
                    education: true,
                    clinic: true,
                    user: {
                        select: {
                            userId: true,
                            fullName: true,
                            email: true,
                            phone: true,
                            gender: true,
                            avatar: true,
                        },
                    },
                    specialty: {
                        select: {
                            specialtyId: true,
                            name: true,
                        },
                    },
                    hospital: {
                        select: {
                            hospitalId: true,
                            name: true,
                            address: true,
                        },
                    },
                    schedules: true,
                    appointments: true,
                },
            }),
            this.prisma.doctor.count({ where }),
        ]);

        const totalPages = Math.ceil(totalCount / limit);
        return {
            message: "Request successfully handled get all",
            code: 200,
            data: doctors,
            meta: {
                total: totalCount,
                page,
                limit,
                totalPages,
            },
        };
    }


    // 🔍 Lấy thông tin bác sĩ theo ID
    async getDoctorById(id: number) {
        const doctor = await this.prisma.doctor.findUnique({
            where: { doctorId: id },
            include: {
                user: true,
                specialty: true,
                hospital: true,
                schedules: true,
                appointments: false,
                achievements: true,
                certifications: true
            },
        });

        if (!doctor) {
            throw new NotFoundException(`Doctor with ID ${id} not found`);
        }

        return doctor;
    }

    // ✏️ Cập nhật bác sĩ
    async updateDoctor(id: number, dto: UpdateDoctor) {
        const doctor = await this.prisma.doctor.findUnique({
            where: { doctorId: id },
        });

        if (!doctor) {
            throw new NotFoundException(`Doctor with ID ${id} not found`);
        }

        if (dto.userId && dto.userId !== doctor.userId) {
            const userIdTaken = await this.prisma.doctor.findUnique({
                where: { userId: dto.userId },
            });
            if (userIdTaken) {
                throw new BadRequestException(`Doctor with userId ${dto.userId} already exists.`);
            }
        }

        if (dto.specialtyId) {
            const specialty = await this.prisma.specialty.findUnique({
                where: { specialtyId: dto.specialtyId },
            });
            if (!specialty) {
                throw new BadRequestException(`Specialty with ID ${dto.specialtyId} does not exist.`);
            }
        }

        if (dto.hospitalId) {
            const hospital = await this.prisma.hospital.findUnique({
                where: { hospitalId: dto.hospitalId },
            });
            if (!hospital) {
                throw new BadRequestException(`Hospital with ID ${dto.hospitalId} does not exist.`);
            }
        }

        const updateData: any = {};

        if (dto.userId) updateData.userId = dto.userId;
        if (dto.specialtyId) updateData.specialtyId = dto.specialtyId;
        if (dto.hospitalId) updateData.hospitalId = dto.hospitalId;
        if (dto.rating !== undefined) updateData.rating = dto.rating;
        if (dto.bio !== undefined) updateData.bio = dto.bio;
        if (dto.yearsOfExperience !== undefined) updateData.yearsOfExperience = dto.yearsOfExperience;
        if (dto.education !== undefined) updateData.education = dto.education;
        if (dto.clinic !== undefined) updateData.clinic = dto.clinic;

        const updatedDoctor = await this.prisma.doctor.update({
            where: { doctorId: id },
            data: updateData,
            include: {
                achievements: true,
            },
        });

        return {
            message: 'Doctor updated successfully.',
            doctor: updatedDoctor,
        };
    }

    // ❌ Xoá bác sĩ
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
                achievements: true,
            },
        });
    }

    // 📊 Lấy performance bác sĩ trong tháng hiện tại
    async getDoctorPerformanceCurrentMonth(id: number) {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

        const appointmentCount = await this.prisma.appointment.count({
            where: {
                doctorId: id,
                scheduledTime: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        });

        const feedbacks = await this.prisma.feedback.findMany({
            where: {
                appointment: { doctorId: id },
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: { rating: true },
        });

        const countFeedBack = feedbacks.length;
        const avgRating =
            feedbacks.length > 0
                ? parseFloat(
                    (feedbacks.reduce((sum, fb) => sum + fb.rating, 0) / feedbacks.length).toFixed(2),
                )
                : null;

        return {
            appointmentCount,
            avgRating,
            countFeedBack,
        };
    }

    // 🔍 Lọc bác sĩ theo specialty, rating, hospital
    async filterDoctors(params: {
        specialtyId?: number;
        minRating?: number;
        hospitalId?: number;
        page?: number;
        limit?: number;
    }) {
        const { specialtyId, minRating, hospitalId, page = 1, limit = 10 } = params;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (specialtyId) where.specialtyId = +specialtyId;
        if (hospitalId) where.hospitalId = +hospitalId;
        if (typeof minRating !== 'undefined') {
            where.rating = {
                not: null,
                gte: Number(minRating),
            };
        }

        const [doctors, totalCount] = await Promise.all([
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

        const totalPages = Math.ceil(totalCount / limit);
        return {
            message: "Request successfully handled",
            code: 200,
            data: doctors,
            meta: {
                total: totalCount,
                page,
                limit,
                totalPages,
            },
        };
    }


    async getTopRatedDoctors() {
        return this.prisma.doctor.findMany({
            where: {
                rating: {
                    not: null,
                },
            },
            orderBy: {
                rating: 'desc',
            },
            take: 3,
            include: {
                user: true,
                specialty: true,
                hospital: true,
                schedules: true,
                appointments: true,
                achievements: true,
            },
        });
    }

    async getDoctorByUserId(id: number) {
        const doctor = await this.prisma.doctor.findUnique({
            where: { userId: id },
            include: {
                user: true,
                specialty: true,
                hospital: true,
                schedules: true,
                appointments: false,
                achievements: true,
                certifications: true
            },
        })

        if (!doctor) {
            throw new NotFoundException("Not Found doctor of userId ", `${id}`
            )
        }

        return {
            message: "Request successfully handled",
            code: 200,
            data: doctor,
        }
    }

    getCountOfDoctors() {
        return this.prisma.doctor.count().then(count => {
            return {
                message: "Request successfully handled",
                code: 200,
                data: count,
            };
        });
    }

    async getDoctorsByUserIdsPaginated(
        userIds: number[],
        page = 1,
        limit = 10
    ) {
        const skip = (page - 1) * limit;

        // Bỏ trùng
        const uniqueUserIds = Array.from(new Set(userIds));

        // Lấy danh sách userId có role là DOCTOR
        const doctorUsers = await this.prisma.user.findMany({
            where: {
                userId: { in: uniqueUserIds },
                role: 'DOCTOR',
            },
            select: { userId: true },
        });

        const doctorUserIds = doctorUsers.map(user => user.userId);

        if (doctorUserIds.length === 0) {
            return {
                message: 'No doctor users found in the given list.',
                data: [],
                meta: {
                    total: 0,
                    page,
                    limit,
                    totalPages: 0,
                },
            };
        }

        const total = await this.prisma.doctor.count({
            where: {
                userId: { in: doctorUserIds },
            },
        });

        const doctors = await this.prisma.doctor.findMany({
            where: {
                userId: { in: doctorUserIds },
            },
            skip,
            take: limit,
            include: {
                user: true,
                specialty: true,
                hospital: true,
                achievements: true,
                appointments: {
                    include: {
                        feedback: true,
                    },
                },
            },
        });

        // Tính số review cho từng bác sĩ
        const doctorsWithReviewCount = doctors.map(doctor => {
            const reviewCount = doctor.appointments.filter(a => a.feedback !== null).length;
            const { appointments, ...rest } = doctor;
            return {
                ...rest,
                reviews: reviewCount,
            };
        });

        const totalPages = Math.ceil(total / limit);

        return {
            message: 'Doctors fetched successfully.',
            data: doctorsWithReviewCount,
            meta: {
                total,
                page,
                limit,
                totalPages,
            },
        };
    }


}
