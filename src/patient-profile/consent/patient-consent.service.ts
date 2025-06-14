import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PatientConsentService {
  constructor(private readonly prisma: PrismaService) {}

  async grantConsent(params: {
    patientId: number;
    grantedToId: number;
    dataType: string;
    purpose: string;
    validUntil: Date;
  }) {
    return this.prisma.patientConsent.create({
      data: {
        patientId: params.patientId,
        grantedToId: params.grantedToId,
        dataType: params.dataType,
        purpose: params.purpose,
        validUntil: params.validUntil,
        status: 'ACTIVE'
      }
    });
  }

  async revokeConsent(consentId: number) {
    return this.prisma.patientConsent.update({
      where: { id: consentId },
      data: { 
        status: 'REVOKED',
        revokedAt: new Date()
      }
    });
  }

  async verifyConsent(params: {
    patientId: number;
    requestedById: number;
    dataType: string;
  }) {
    const consent = await this.prisma.patientConsent.findFirst({
      where: {
        patientId: params.patientId,
        grantedToId: params.requestedById,
        dataType: params.dataType,
        status: 'ACTIVE',
        validUntil: {
          gte: new Date()
        }
      }
    });

    return !!consent;
  }

  async logAccess(params: {
    patientId: number;
    accessedById: number;
    dataType: string;
    purpose: string;
  }) {
    return this.prisma.accessLog.create({
      data: {
        patientId: params.patientId,
        accessedById: params.accessedById,
        dataType: params.dataType,
        purpose: params.purpose,
        timestamp: new Date()
      }
    });
  }

  async getAccessLogs(patientId: number) {
    return this.prisma.accessLog.findMany({
      where: { patientId },
      include: {
        accessedBy: true
      },
      orderBy: {
        timestamp: 'desc'
      }
    });
  }
}
