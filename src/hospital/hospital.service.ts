import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateHospital, UpdateHospital } from './DTO';

@Injectable()
export class HospitalService {
    constructor(private readonly prisma: PrismaService) { }

    async createHospital(data: CreateHospital) {
        const emailExists = await this.prisma.hospital.findFirst({
            where: { Email: data.email },
        });

        if (emailExists) {
            throw new BadRequestException('Email already exists.');
        }

        const hospital = await this.prisma.hospital.create({
            data: {
                Name: data.name,
                Address: data.address,
                Phone: data.phone,
                Description: data.description,
                Email: data.email,
                establishYear: data.establishYear,
                Type: data.type,
            },
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

        if (dto.email && dto.email !== hospital.Email) {
            const emailExists = await this.prisma.hospital.findFirst({
                where: { Email: dto.email },
            });
            if (emailExists) {
                throw new BadRequestException('Email already exists.');
            }
        }

        return this.prisma.hospital.update({
            where: { Hospital_ID: id },
            data: dto,
        });
    }

    async deleteHospital(id: number) {
        const hospital = await this.prisma.hospital.findUnique({
            where: { Hospital_ID: id },
        });

        if (!hospital) {
            throw new NotFoundException(`Hospital with ID ${id} not found`);
        }

        const doctorsCount = await this.prisma.doctor.count({
            where: { Hospital_ID: id },
        });

        if (doctorsCount > 0) {
            throw new BadRequestException('Cannot delete hospital with existing doctors.');
        }

        const appointmentsCount = await this.prisma.appointment.count({
            where: { Hospital_ID: id },
        });

        if (appointmentsCount > 0) {
            throw new BadRequestException('Cannot delete hospital with existing appointments.');
        }

        return this.prisma.hospital.delete({
            where: { Hospital_ID: id },
        });
    }
}
