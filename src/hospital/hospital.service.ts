import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateHospital, UpdateHospital } from './DTO';

@Injectable()
export class HospitalService {
    constructor(private readonly prisma: PrismaService) { }

    // Create Hospital
    async createHospital(data: CreateHospital) {
        const emailExists = await this.prisma.hospital.findFirst({
            where: { email: data.email },
        });

        if (emailExists) {
            throw new BadRequestException('email already exists.');
        }

        const hospital = await this.prisma.hospital.create({
            data: {
                name: data.email,
                address: data.address,
                phone: data.phone,
                description: data.description,
                email: data.email,
                establishYear: data.establishYear,
                type: data.type,
                logo: data.logo,
                workScheduling: data.workScheduling,
                website: data.website,
            },
            include: {
                achievements: true,
            },
        });

        return {
            message: 'Hospital created successfully',
            hospital,
        };
    }

    // Get all hospitals with pagination
    async getAllHospitals(page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const [hospitals, total] = await Promise.all([
            this.prisma.hospital.findMany({
                skip,
                take: limit,
                include: {
                    doctors: true,
                    achievements: true,
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

    // Get single hospital by ID
    async getHospitalById(id: number) {
        const hospital = await this.prisma.hospital.findUnique({
            where: { hospitalId: id },
            include: {
                doctors: true,
                achievements: true,
            },
        });

        if (!hospital) {
            throw new NotFoundException(`Hospital with ID ${id} not found`);
        }

        return hospital;
    }

    // Update hospital
    async updateHospital(id: number, dto: UpdateHospital) {
        const hospital = await this.prisma.hospital.findUnique({
            where: { hospitalId: id },
        });

        if (!hospital) {
            throw new NotFoundException(`Hospital with ID ${id} not found`);
        }

        if (dto.email && dto.email !== hospital.email) {
            const emailExists = await this.prisma.hospital.findFirst({
                where: { email: dto.email },
            });
            if (emailExists) {
                throw new BadRequestException('email already exists.');
            }
        }

        const updated = await this.prisma.hospital.update({
            where: { hospitalId: id },
            data: dto,
            include: {
                achievements: true,
            },
        });

        return {
            message: 'Hospital updated successfully',
            hospital: updated,
        };
    }

    // Delete hospital
    async deleteHospital(id: number) {
        const hospital = await this.prisma.hospital.findUnique({
            where: { hospitalId: id },
        });

        if (!hospital) {
            throw new NotFoundException(`Hospital with ID ${id} not found`);
        }

        const doctorsCount = await this.prisma.doctor.count({
            where: { hospitalId: id },
        });

        if (doctorsCount > 0) {
            throw new BadRequestException(
                'Cannot delete hospital with existing doctors.',
            );
        }

        return this.prisma.hospital.delete({
            where: { hospitalId: id },
            include: {
                achievements: true,
            },
        });
    }
}
