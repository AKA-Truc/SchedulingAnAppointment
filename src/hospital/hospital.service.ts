import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateHospital, UpdateHospital } from './DTO';

@Injectable()
export class HospitalService {
    constructor(private readonly prisma: PrismaService) { }

    async createHospital(data: CreateHospital) {
        const emailExists = await this.prisma.hospital.findFirst({
            where: { Email: data.Email },
        });

        if (emailExists) {
            throw new BadRequestException('Email already exists.');
        }

        const hospital = await this.prisma.hospital.create({
            data: {
                Name: data.Name,
                Address: data.Address,
                Phone: data.Phone,
                Description: data.Description,
                Email: data.Email,
                establishYear: data.establishYear,
                Type: data.Type,
                website: data.website
            },
            include: {
                achievements: true
            }
        });

        return {
            message: 'Hospital created successfully',
            hospital,
        };
    }

    async getAllHospitals(page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const [hospitals, total] = await Promise.all([
            this.prisma.hospital.findMany({
                skip,
                take: limit,
                include: {
                    doctors: true,
                    appointments: true,
                    achievements: true
                },
            }),
            this.prisma.hospital.count(),
        ]);

        return {
            data: hospitals,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getHospitalById(id: number) {
        const hospital = await this.prisma.hospital.findUnique({
            where: { Hospital_ID: id },
            include: {
                doctors: true,
                appointments: true,
                achievements: true
            },
        });

        if (!hospital) {
            throw new NotFoundException(`Hospital with ID ${id} not found`);
        }

        return hospital;
    }

    async updateHospital(id: number, dto: UpdateHospital) {
        const hospital = await this.prisma.hospital.findUnique({
            where: { Hospital_ID: id },
        });

        if (!hospital) {
            throw new NotFoundException(`Hospital with ID ${id} not found`);
        }

        // Nếu update email, kiểm tra email đã tồn tại chưa
        if (dto.Email && dto.Email !== hospital.Email) {
            const emailExists = await this.prisma.hospital.findFirst({
                where: { Email: dto.Email },
            });
            if (emailExists) {
                throw new BadRequestException('Email already exists.');
            }
        }

        return this.prisma.hospital.update({
            where: { Hospital_ID: id },
            data: dto,
            include: {
                achievements: true
            }
        });
    }

    async deleteHospital(id: number) {
        const hospital = await this.prisma.hospital.findUnique({
            where: { Hospital_ID: id },
        });

        if (!hospital) {
            throw new NotFoundException(`Hospital with ID ${id} not found`);
        }

        return this.prisma.hospital.delete({
            where: { Hospital_ID: id },
            include: {
                achievements: true
            }
        });
    }
}
