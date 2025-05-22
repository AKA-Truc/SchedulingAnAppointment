import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePatientProfile, UpdatePatientProfile } from './DTO';

@Injectable()
export class PatientProfileService {
    constructor(private readonly prisma: PrismaService) { }

    // Create
    async create(data: CreatePatientProfile) {
        const existingProfile = await this.prisma.patientProfile.findUnique({
            where: { userId: data.userId },
        });

        if (existingProfile) {
            throw new BadRequestException('Patient profile for this user already exists.');
        }

        const profile = await this.prisma.patientProfile.create({
            data: {
                userId: data.userId,
                gender: data.gender,
                dateOfBirth: new Date(data.dateOfBirth),
                address: data.address,
                insurance: data.insurance,
                allergies: data.allergies,
                chronicDiseases: data.chronicDiseases,
                obstetricHistory: data.obstetricHistory,
                surgicalHistory: data.surgicalHistory,
                familyHistory: data.familyHistory,
                socialHistory: data.socialHistory,
                medicationHistory: data.medicationHistory,
            },
            include: { user: true },
        });

        return profile;
    }

    // Get all (with pagination)
    async findAll(page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const [profiles, total] = await Promise.all([
            this.prisma.patientProfile.findMany({
                skip,
                take: limit,
                include: { user: true },
            }),
            this.prisma.patientProfile.count(),
        ]);

        return {
            data: profiles,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    // Get by ID
    async findOne(id: number) {
        const profile = await this.prisma.patientProfile.findUnique({
            where: { profileId: id },
            include: { user: true },
        });

        if (!profile) {
            throw new NotFoundException(`Patient profile with ID ${id} not found`);
        }

        return profile;
    }

    // Update
    async update(id: number, dto: UpdatePatientProfile) {
        const profile = await this.prisma.patientProfile.findUnique({
            where: { profileId: id },
        });

        if (!profile) {
            throw new NotFoundException(`Patient profile with ID ${id} not found`);
        }

        return this.prisma.patientProfile.update({
            where: { profileId: id },
            data: {
                userId: dto.userId,
                gender: dto.gender,
                dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
                address: dto.address,
                insurance: dto.insurance,
                allergies: dto.allergies,
                chronicDiseases: dto.chronicDiseases,
                obstetricHistory: dto.obstetricHistory,
                surgicalHistory: dto.surgicalHistory,
                familyHistory: dto.familyHistory,
                socialHistory: dto.socialHistory,
                medicationHistory: dto.medicationHistory,
            },
        });
    }

    // Delete
    async remove(id: number) {
        const profile = await this.prisma.patientProfile.findUnique({
            where: { profileId: id },
        });

        if (!profile) {
            throw new NotFoundException(`Patient profile with ID ${id} not found`);
        }

        return this.prisma.patientProfile.delete({
            where: { profileId: id },
        });
    }
}
