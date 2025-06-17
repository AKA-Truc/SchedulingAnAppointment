// src/patient-profile/patient-profile.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePatientProfile, UpdatePatientProfile } from './DTO';
import { HealthAnalytics, VisitStats, CostAnalysis, MedicalHistoryTimeline } from './interfaces/health-analytics.interface';

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
        gender: data.gender,
        dateOfBirth: data.dateOfBirth, // đã là Date nhờ DTO transform
        address: data.address,
        insurance: data.insurance ?? '',
        allergies: data.allergies ?? '',
        chronicDiseases: data.chronicDiseases ?? '',
        obstetricHistory: data.obstetricHistory ?? '',
        surgicalHistory: data.surgicalHistory ?? '',
        familyHistory: data.familyHistory ?? '',
        socialHistory: data.socialHistory ?? '',
        medicationHistory: data.medicationHistory ?? '',
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
        userId: dto.userId ?? profile.userId,
        gender: dto.gender ?? profile.gender,
        dateOfBirth: dto.dateOfBirth ?? profile.dateOfBirth,
        address: dto.address ?? profile.address,
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

  // Health Analytics Methods
  async getHealthAnalytics(profileId: number): Promise<HealthAnalytics> {
    const profile = await this.findOne(profileId);
    if (!profile) {
      throw new NotFoundException(`Patient profile with ID ${profileId} not found`);
    }

    const [visitStats, costAnalysis, medicalHistory] = await Promise.all([
      this.getVisitStats(profileId),
      this.getCostAnalysis(profileId),
      this.getMedicalHistory(profileId),
    ]);

    return {
      visitStats,
      costAnalysis,
      medicalHistory,
    };
  }
  private async getVisitStats(profileId: number): Promise<VisitStats> {
    const appointments = await this.prisma.appointment.findMany({
      where: {
        userId: profileId,
      },
      orderBy: {
        scheduledTime: 'desc',
      },
    });

    const visitsByMonth = appointments.reduce((acc, appointment) => {
      const monthYear = appointment.scheduledTime.toISOString().slice(0, 7);
      acc[monthYear] = (acc[monthYear] || 0) + 1;
      return acc;
    }, {});

    return {
      totalVisits: appointments.length,
      visitsByMonth: Object.entries(visitsByMonth).map(([month, count]) => ({
        month,
        count: count as number,
      })),
      averageVisitsPerMonth: appointments.length / Object.keys(visitsByMonth).length || 0,
      lastVisitDate: appointments[0]?.scheduledTime || null,
    };
  }  private async getCostAnalysis(profileId: number): Promise<CostAnalysis> {
    const payments = await this.prisma.payment.findMany({
      where: {
        appointment: {
          userId: profileId,
        },
      },
      select: {
        createdAt: true,
        price: true,
        paymentMethod: true,
        appointmentId: true,
      },
    });

    const costByMonth = payments.reduce((acc, payment) => {
      const monthYear = payment.createdAt.toISOString().slice(0, 7);
      acc[monthYear] = (acc[monthYear] || 0) + payment.price;
      return acc;
    }, {} as Record<string, number>);

    const costByPaymentMethod = payments.reduce((acc, payment) => {
      acc[payment.paymentMethod] = (acc[payment.paymentMethod] || 0) + payment.price;
      return acc;
    }, {} as Record<string, number>);

    const totalCost = payments.reduce((sum, payment) => sum + payment.price, 0);

    return {
      totalCost,
      costByMonth: Object.entries(costByMonth).map(([month, amount]) => ({
        month,
        amount: amount as number,
      })),
      averageCostPerVisit: totalCost / payments.length || 0,
      costByPaymentMethod: Object.entries(costByPaymentMethod).map(([method, amount]) => ({
        method,
        amount: amount as number,
      })),
    };
  }  private async getMedicalHistory(profileId: number): Promise<MedicalHistoryTimeline> {
    // Get appointments
    const appointments = await this.prisma.appointment.findMany({
      where: {
        userId: profileId,
      },
      select: {
        scheduledTime: true,
        note: true,
        doctorId: true,
        appointmentId: true,
      },
      orderBy: {
        scheduledTime: 'desc',
      },
    });    // Get medical records for appointments
    const medicalRecords = await this.prisma.medicalRecord.findMany({
      where: {
        userId: profileId,
      },
      select: {
        medicalRecordId: true,
        diagnosis: true,
        testResult: true,
        doctorNotes: true,        prescriptions: {
          select: {
            medicineName: true,
            dosage: true,
          },
        },
      },
    });

    // Get doctors and their user details
    const doctors = await this.prisma.doctor.findMany({
      where: {
        doctorId: {
          in: [...new Set(appointments.map(a => a.doctorId))]
        }
      },
      select: {
        doctorId: true,
        user: {
          select: {
            fullName: true,
          },
        },
        hospital: {
          select: {
            name: true,
          },
        },
      },
    });

    const doctorMap = new Map(
      doctors.map(doctor => [doctor.doctorId, doctor])
    );

    return {
      appointments: appointments.map(appointment => {
        const medicalRecord = medicalRecords.find(
          record => record.medicalRecordId === appointment.appointmentId
        );
        const doctor = doctorMap.get(appointment.doctorId);

        return {
          date: appointment.scheduledTime,
          doctorName: doctor?.user?.fullName || 'Unknown Doctor',
          hospitalName: doctor?.hospital?.name || 'Unknown Hospital',
          diagnosis: medicalRecord?.diagnosis || '',
          prescriptions: medicalRecord?.prescriptions?.map(prescription => ({
            medicineName: prescription.medicineName,
            dosage: prescription.dosage,
          })) || [],
        };
      }),
    };
  }
}
