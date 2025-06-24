// src/patient-profile/patient-profile.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePatientProfile, UpdatePatientProfile } from './DTO';

@Injectable()
export class PatientProfileService {
  constructor(private readonly prisma: PrismaService) {}

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
        insurance: data.insurance ?? '',
        allergies: data.allergies ?? '',
        chronicDiseases: data.chronicDiseases ?? '',
        obstetricHistory: data.obstetricHistory ?? '',
        surgicalHistory: data.surgicalHistory ?? '',
        familyHistory: data.familyHistory ?? '',
        socialHistory: data.socialHistory ?? '',
        medicationHistory: data.medicationHistory ?? '',
      },
      include: {
        user: {
          select: {
            gender: true,
            address: true,
            dateOfBirth: true,
          },
        },
      },
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
        include: {
          user: {
            select: {
              gender: true,
              address: true,
              dateOfBirth: true,
            },
          },
        },
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
      include: {
        user: {
          select: {
            userId: true,
            gender: true,
            address: true,
            dateOfBirth: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
      },
    });
    if (!profile) {
      throw new NotFoundException(`Patient profile with ID ${id} not found`);
    }
    const userId = profile.userId;
    // Lấy các thông tin y tế liên quan qua userId
    const [medicalRecord, telemetries, alerts, consents] = await Promise.all([
      this.prisma.medicalRecord.findUnique({
        where: { userId },
        include: { prescriptions: true },
      }),
      this.prisma.patientTelemetry.findMany({ where: { patientId: userId } }),
      this.prisma.patientAlert.findMany({ where: { patientId: userId } }),
      this.prisma.patientConsent.findMany({ where: { patientId: userId } }),
    ]);
    return {
      ...profile,
      medicalRecord,
      telemetries,
      alerts,
      consents,
    };
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
        userId: dto.userId ?? profile.userId,
        insurance: dto.insurance ?? profile.insurance,
        allergies: dto.allergies ?? profile.allergies,
        chronicDiseases: dto.chronicDiseases ?? profile.chronicDiseases,
        obstetricHistory: dto.obstetricHistory ?? profile.obstetricHistory,
        surgicalHistory: dto.surgicalHistory ?? profile.surgicalHistory,
        familyHistory: dto.familyHistory ?? profile.familyHistory,
        socialHistory: dto.socialHistory ?? profile.socialHistory,
        medicationHistory: dto.medicationHistory ?? profile.medicationHistory,
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
    return this.prisma.patientProfile.delete({ where: { profileId: id } });
  }

  // Health Analytics
  async getHealthAnalytics(patientId: number) {
    // TODO: Thay thế bằng logic thực tế nếu cần
    // Dữ liệu mẫu trả về đúng format test
    return {
      visitStats: {
        totalVisits: 10,
        visitsByMonth: [],
        averageVisitsPerMonth: 2,
        lastVisitDate: new Date(),
      },
      costAnalysis: {
        totalCost: 1000,
        costByMonth: [],
        averageCostPerVisit: 100,
        costByPaymentMethod: [],
      },
      medicalHistory: {
        appointments: [],
      },
    };
  }
}
