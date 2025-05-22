import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSpecialty, UpdateSpecialty } from '../DTO';

@Injectable()
export class SpecialtyService {
    constructor(private readonly prisma: PrismaService) { }

    // Create specialty
    async create(dto: CreateSpecialty) {
        const exists = await this.prisma.specialty.findFirst({
            where: { name: dto.name },
        });
        if (exists) {
            throw new BadRequestException(`Specialty with name "${dto.name}" already exists.`);
        }

        const specialty = await this.prisma.specialty.create({
            data: {
                name: dto.name,
                description: dto.description,
            },
        });

        return {
            message: 'Specialty created successfully.',
            specialty,
        };
    }

    // Get all specialties (with pagination)
    async findAll(page = 1, limit = 10) {
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

    // Get specialty by ID
    async findOne(id: number) {
        const specialty = await this.prisma.specialty.findUnique({
            where: { specialtyId: id },
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
    async update(id: number, dto: UpdateSpecialty) {
        const specialty = await this.prisma.specialty.findUnique({
            where: { specialtyId: id },
        });

        if (!specialty) {
            throw new NotFoundException(`Specialty with ID ${id} not found`);
        }

        if (dto.name && dto.name !== specialty.name) {
            const nameTaken = await this.prisma.specialty.findFirst({
                where: { name: dto.name },
            });
            if (nameTaken) {
                throw new BadRequestException(`Specialty with name "${dto.name}" already exists.`);
            }
        }

        return this.prisma.specialty.update({
            where: { specialtyId: id },
            data: {
                name: dto.name,
                description: dto.description,
            },
        });
    }

    // Delete specialty
    async remove(id: number) {
        const specialty = await this.prisma.specialty.findUnique({
            where: { specialtyId: id },
        });

        if (!specialty) {
            throw new NotFoundException(`Specialty with ID ${id} not found`);
        }

        const doctorsCount = await this.prisma.doctor.count({
            where: { specialtyId: id },
        });

        if (doctorsCount > 0) {
            throw new BadRequestException('Cannot delete specialty because there are doctors associated.');
        }

        return this.prisma.specialty.delete({
            where: { specialtyId: id },
        });
    }
}
