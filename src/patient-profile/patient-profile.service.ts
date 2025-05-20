import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePatientProfile, UpdatePatientProfile } from './DTO';

@Injectable()
export class PatientProfileService {
    constructor(private readonly prisma: PrismaService) { }

    // Create
    async create(data: CreatePatientProfile) {
        const existingProfile = await this.prisma.patientProfile.findUnique({
            where: { User_ID: data.userId },
        });

        if (existingProfile) {
            throw new BadRequestException('Patient profile for this user already exists.');
        }

        const profile = await this.prisma.patientProfile.create({
            data: {
                User_ID: data.userId,
                Gender: data.gender,
                DateOfBirth: new Date(data.dateOfBirth),
                Address: data.address,
                Insurance: data.insurance,
                Allergies: data.allergies,
                ChronicDiseases: data.chronicDiseases,
                obstetricHistory: data.obstetricHistory,
                surgicalHistory: data.surgicalHistory,
                familyHistory: data.familyHistory,
                socialHistory: data.socialHistory,
                medicationHistory: data.medicationHistory,
            },
            include: { User: true },
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
                include: { User: true },
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
            where: { Profile_ID: id },
            include: { User: true },
        });

        if (!profile) {
            throw new NotFoundException(`Patient profile with ID ${id} not found`);
        }

        return profile;
    }

    // Update
    async update(id: number, dto: UpdatePatientProfile) {
        const profile = await this.prisma.patientProfile.findUnique({
            where: { Profile_ID: id },
        });

        if (!profile) {
            throw new NotFoundException(`Patient profile with ID ${id} not found`);
        }

        return this.prisma.patientProfile.update({
            where: { Profile_ID: id },
            data: {
                User_ID: dto.userId,
                Gender: dto.gender,
                DateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
                Address: dto.address,
                Insurance: dto.insurance,
                Allergies: dto.allergies,
                ChronicDiseases: dto.chronicDiseases,
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
            where: { Profile_ID: id },
        });

        if (!profile) {
            throw new NotFoundException(`Patient profile with ID ${id} not found`);
        }

        return this.prisma.patientProfile.delete({
            where: { Profile_ID: id },
        });
    }
}
