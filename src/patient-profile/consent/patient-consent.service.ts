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
    consentType: string;
    startDate: Date;
    terms: string;
  }) {
    const consent = await this.prisma.patientConsent.create({
      data: {
        patientId: params.patientId,
        consentType: params.consentType as any,
        startDate: params.startDate,
        terms: params.terms,
        status: 'GRANTED'
      }
    });

    // Emit event for compliance monitoring
    this.eventEmitter.emit('consent.granted', {
      consentId: consent.id,
      patientId: params.patientId,
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
        status: 'WITHDRAWN'
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
  }) {
    const consent = await this.prisma.patientConsent.findFirst({
      where: {
        patientId: params.patientId,
        status: 'GRANTED',
      }
    });

    return !!consent;
  }
}
