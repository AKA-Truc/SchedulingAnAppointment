import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateConsentDto } from './dto/create-consent.dto';

@Injectable()
export class ConsentService {
  constructor(
    private readonly prisma: PrismaService
  ) {}

  async createConsent(patientId: number, createConsentDto: CreateConsentDto) {
    return this.prisma.patientConsent.create({
      data: {
        patientId,
        ...createConsentDto,
      },
    });
  }

  async getPatientConsents(patientId: number) {
    return this.prisma.patientConsent.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getActiveConsents(patientId: number) {
    const now = new Date();
    return this.prisma.patientConsent.findMany({
      where: {
        patientId,
        status: 'GRANTED',
        startDate: { lte: now },
        OR: [
          { endDate: null },
          { endDate: { gt: now } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateConsentStatus(id: number, status: 'DENIED' | 'WITHDRAWN') {
    return this.prisma.patientConsent.update({
      where: { id },
      data: { status },
    });
  }
}
