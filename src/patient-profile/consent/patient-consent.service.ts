import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ComplianceReportService } from './services/compliance-report.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class PatientConsentService {
  private readonly logger = new Logger(PatientConsentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly complianceService: ComplianceReportService,
    private readonly eventEmitter: EventEmitter2
  ) {}
  async grantConsent(params: {
    patientId: number;
    grantedToId: number;
    dataType: string;
    purpose: string;
    validUntil: Date;
  }) {
    const consent = await this.prisma.patientConsent.create({
      data: {
        patientId: params.patientId,
        grantedToId: params.grantedToId,
        dataType: params.dataType,
        purpose: params.purpose,
        validUntil: params.validUntil,
        status: 'ACTIVE'
      }
    });

    // Emit event for compliance monitoring
    this.eventEmitter.emit('consent.granted', {
      consentId: consent.id,
      patientId: params.patientId,
      grantedToId: params.grantedToId,
      dataType: params.dataType,
      timestamp: new Date()
    });

    // Generate compliance report
    await this.complianceService.generateComplianceReport(
      params.patientId,
      new Date(new Date().setDate(new Date().getDate() - 30)), // Last 30 days
      new Date()
    );

    return consent;
  }
  async revokeConsent(consentId: number) {
    const consent = await this.prisma.patientConsent.update({
      where: { id: consentId },
      data: { 
        status: 'REVOKED',
        revokedAt: new Date()
      }
    });

    // Emit event for compliance monitoring
    this.eventEmitter.emit('consent.revoked', {
      consentId,
      patientId: consent.patientId,
      timestamp: new Date()
    });

    // Generate compliance report
    await this.complianceService.generateComplianceReport(
      consent.patientId,
      new Date(new Date().setDate(new Date().getDate() - 30)),
      new Date()
    );

    return consent;
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
