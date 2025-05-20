import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSpecialty, UpdateSpecialty } from './DTO';

@Injectable()
export class SpecialtyService {
    constructor(private readonly prisma: PrismaService) { }

    // Create specialty
    async createSpecialty(data: CreateSpecialty) {
        // Kiểm tra xem tên Specialty có tồn tại chưa (nếu muốn)
        const exists = await this.prisma.specialty.findFirst({
            where: { Name: data.name },
        });
        if (exists) {
            throw new BadRequestException(`Specialty with name "${data.name}" already exists.`);
        }

        const specialty = await this.prisma.specialty.create({
            data: {
                Name: data.name,
                Description: data.description,
            },
        });

        return {
            message: 'Specialty created successfully.',
            specialty,
        };
    }

    // Get all specialties có phân trang
    async getAllSpecialties(page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const [specialties, total] = await Promise.all([
            this.prisma.specialty.findMany({
                skip,
                take: limit,
                include: {
                    doctors: true,
                },
            }),
            this.prisma.specialty.count(),
        ]);

        return {
            data: specialties,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    // Get specialty by id
    async getSpecialtyById(id: number) {
        const specialty = await this.prisma.specialty.findUnique({
            where: { Specialty_ID: id },
            include: {
                doctors: true,
            },
        });

        if (!specialty) {
            throw new NotFoundException(`Specialty with ID ${id} not found`);
        }

        return specialty;
    }

    // Update specialty
    async updateSpecialty(id: number, dto: UpdateSpecialty) {
        const specialty = await this.prisma.specialty.findUnique({
            where: { Specialty_ID: id },
        });

        if (!specialty) {
            throw new NotFoundException(`Specialty with ID ${id} not found`);
        }

        // Nếu muốn check tên không trùng với specialty khác
        if (dto.name && dto.name !== specialty.Name) {
            const nameTaken = await this.prisma.specialty.findFirst({
                where: { Name: dto.name },
            });
            if (nameTaken) {
                throw new BadRequestException(`Specialty with name "${dto.name}" already exists.`);
            }
        }

        return this.prisma.specialty.update({
            where: { Specialty_ID: id },
            data: {
                Name: dto.name,
                Description: dto.description,
            },
        });
    }

    // Delete specialty
    async deleteSpecialty(id: number) {
        const specialty = await this.prisma.specialty.findUnique({
            where: { Specialty_ID: id },
        });

        if (!specialty) {
            throw new NotFoundException(`Specialty with ID ${id} not found`);
        }

        // Nếu muốn kiểm tra xem specialty có doctor chưa rồi mới xoá
        const doctorsCount = await this.prisma.doctor.count({
            where: { Specialty_ID: id },
        });
        if (doctorsCount > 0) {
            throw new BadRequestException('Cannot delete specialty because there are doctors associated.');
        }

        return this.prisma.specialty.delete({
            where: { Specialty_ID: id },
        });
    }
}
