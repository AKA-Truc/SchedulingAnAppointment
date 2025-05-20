import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDoctor, UpdateDoctor } from './DTO';

@Injectable()
export class DoctorService {
    constructor(private readonly prisma: PrismaService) { }

    // Create doctor
    async createDoctor(data: CreateDoctor) {
        // Kiểm tra userId đã có bác sĩ chưa (do User_ID là unique)
        const existingDoctor = await this.prisma.doctor.findUnique({
            where: { User_ID: data.userId },
        });
        if (existingDoctor) {
            throw new BadRequestException(`Doctor with userId ${data.userId} already exists.`);
        }

        // Có thể kiểm tra Specialty_ID, Hospital_ID tồn tại (tuỳ bạn có muốn)
        // ...

        const doctor = await this.prisma.doctor.create({
            data: {
                User_ID: data.userId,
                Specialty_ID: data.specialtyId,
                Hospital_ID: data.hospitalId,
                Phone: data.phone,
                Rating: data.rating,
                Bio: data.bio,
                yearsOfExperience: data.yearsOfExperience,
                certifications: data.certifications,
                website: data.website,
                education: data.education
            },
            include: {
                achievements: true
            }
        });

        return {
            message: 'Doctor created successfully.',
            doctor,
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
                    User: true,
                    Specialty: true,
                    Hospital: true,
                    schedules: true,
                    leaves: true,
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
            where: { Doctor_ID: id },
            include: {
                User: true,
                Specialty: true,
                Hospital: true,
                schedules: true,
                leaves: true,
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
            where: { Doctor_ID: id },
        });

        if (!doctor) {
            throw new NotFoundException(`Doctor with ID ${id} not found`);
        }

        // Nếu update userId, kiểm tra đã có doctor với userId đó chưa (unique)
        if (dto.userId && dto.userId !== doctor.User_ID) {
            const userIdTaken = await this.prisma.doctor.findUnique({
                where: { User_ID: dto.userId },
            });
            if (userIdTaken) {
                throw new BadRequestException(`Doctor with userId ${dto.userId} already exists.`);
            }
        }

        return this.prisma.doctor.update({
            where: { Doctor_ID: id },
            data: dto,
            include: {
                achievements: true
            }
        });
    }

    // Delete doctor
    async deleteDoctor(id: number) {
        const doctor = await this.prisma.doctor.findUnique({
            where: { Doctor_ID: id },
        });

        if (!doctor) {
            throw new NotFoundException(`Doctor with ID ${id} not found`);
        }

        return this.prisma.doctor.delete({
            where: { Doctor_ID: id },
            include: {
                achievements: true
            }
        });
    }
}
