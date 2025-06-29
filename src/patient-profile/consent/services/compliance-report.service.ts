import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ConsentReport,
  ComplianceIssue,
  ConsentSummary,
  AccessLogSummary,
  GDPRComplianceStatus,
  HIPAAComplianceStatus
} from '../interfaces/compliance.interface';
import { PatientConsentService } from '../patient-consent.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ComplianceReportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly consentService: PatientConsentService
  ) {}

  async generateComplianceReport(patientId: number, startDate: Date, endDate: Date): Promise<ConsentReport> {
    const [activeConsents, revokedConsents] = await Promise.all([
      this.getActiveConsents(patientId, startDate, endDate),
      this.getRevokedConsents(patientId, startDate, endDate)
      // this.getAccessLogs(patientId, startDate, endDate) // Không có accessLog trong schema
    ]);

    // const gdprCompliance = await this.checkGDPRCompliance(patientId, activeConsents, accessLogs);
    // const hipaaCompliance = await this.checkHIPAACompliance(patientId, activeConsents, accessLogs);
    const gdprCompliance = await this.checkGDPRCompliance(patientId, activeConsents, []);
    const hipaaCompliance = await this.checkHIPAACompliance(patientId, activeConsents, []);

    return {
      patientId,
      period: { start: startDate, end: endDate },
      activeConsents,
      revokedConsents,
      dataAccesses: [], // Không có accessLog
      gdprCompliance,
      hipaaCompliance
    };
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async generateDailyComplianceReports() {
    const patients = await this.prisma.patientProfile.findMany();
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 1);

    for (const patient of patients) {
      const report = await this.generateComplianceReport(patient.profileId, startDate, endDate);
      await this.storeComplianceReport(report);
    }
  }

  private async getActiveConsents(patientId: number, start: Date, end: Date): Promise<ConsentSummary[]> {
    const consents = await this.prisma.patientConsent.findMany({
      where: {
        patientId,
        status: 'GRANTED',
        startDate: { lte: end },
        OR: [
          { endDate: null },
          { endDate: { gte: start } },
        ],
      },
    });

    return consents.map(c => ({
      id: c.id,
      consentType: c.consentType,
      status: c.status,
      startDate: c.startDate,
      endDate: c.endDate,
      scope: c.scope,
      terms: c.terms,
      witness: c.witness,
      witnessContact: c.witnessContact,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt
    }));
  }

  private async getRevokedConsents(patientId: number, start: Date, end: Date): Promise<ConsentSummary[]> {
    const consents = await this.prisma.patientConsent.findMany({
      where: {
        patientId,
        status: 'WITHDRAWN',
        updatedAt: {
          gte: start,
          lte: end
        }
      },
    });

    return consents.map(c => ({
      id: c.id,
      consentType: c.consentType,
      status: c.status,
      startDate: c.startDate,
      endDate: c.endDate,
      scope: c.scope,
      terms: c.terms,
      witness: c.witness,
      witnessContact: c.witnessContact,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt
    }));
  }

  // private async getAccessLogs(patientId: number, start: Date, end: Date): Promise<AccessLogSummary[]> {
  //   // Không có accessLog trong schema
  //   return [];
  // }

  private async checkGDPRCompliance(
    patientId: number,
    activeConsents: ConsentSummary[],
    accessLogs: any[]
  ): Promise<GDPRComplianceStatus> {
    const issues: ComplianceIssue[] = [];

    const now = new Date();
    const hasValidConsents = activeConsents.every(consent =>
      (!consent.endDate || consent.endDate > now) && consent.terms && consent.scope && consent.scope.length > 0
    );

    if (!hasValidConsents) {
      issues.push({
        type: 'CONSENT',
        severity: 'HIGH',
        description: 'Some consents lack valid terms, scope or have expired',
        recommendation: 'Review and update consent terms, scope and validity periods',
        regulation: 'GDPR Article 6 - Lawfulness of processing',
        affectedData: ['Patient consents']
      });
    }

    const dataMinimization = await this.checkDataMinimization(patientId);
    if (!dataMinimization.compliant) {
      issues.push({
        type: 'PRIVACY',
        severity: 'MEDIUM',
        description: 'Excessive data collection detected',
        recommendation: 'Review and minimize collected data fields',
        regulation: 'GDPR Article 5(1)(c) - Data minimisation',
        affectedData: dataMinimization.excessiveFields
      });
    }

    const storageCompliance = await this.checkStorageCompliance(patientId);
    if (!storageCompliance.compliant) {
      issues.push({
        type: 'STORAGE',
        severity: 'HIGH',
        description: 'Data retention period exceeded or improper storage',
        recommendation: 'Review data retention policies and storage security',
        regulation: 'GDPR Article 5(1)(e) - Storage limitation',
        affectedData: storageCompliance.affectedData
      });
    }

    return {
      isCompliant: issues.length === 0,
      validConsents: hasValidConsents,
      dataMinimization: dataMinimization.compliant,
      storageCompliance: storageCompliance.compliant,
      crossBorderTransfers: true,
      issues
    };
  }

  private async checkHIPAACompliance(
    patientId: number,
    activeConsents: ConsentSummary[],
    accessLogs: AccessLogSummary[]
  ): Promise<HIPAAComplianceStatus> {
    const issues: ComplianceIssue[] = [];

    const privacyRuleCheck = await this.checkPrivacyRuleCompliance(patientId, accessLogs);
    if (!privacyRuleCheck.compliant) {
      issues.push(...privacyRuleCheck.issues);
    }

    const securityRuleCheck = await this.checkSecurityRuleCompliance(patientId);
    if (!securityRuleCheck.compliant) {
      issues.push(...securityRuleCheck.issues);
    }

    const businessAssociatesCheck = this.checkBusinessAssociates(activeConsents);
    if (!businessAssociatesCheck.compliant) {
      issues.push({
        type: 'PRIVACY',
        severity: 'HIGH',
        description: 'Missing or invalid Business Associate Agreements',
        recommendation: 'Update agreements with all business associates',
        regulation: 'HIPAA § 164.502(e)',
        affectedData: businessAssociatesCheck.missingAgreements
      });
    }

    return {
      isCompliant: issues.length === 0,
      privacyRule: privacyRuleCheck.compliant,
      securityRule: securityRuleCheck.compliant,
      breachNotification: true,
      businessAssociates: businessAssociatesCheck.compliant,
      issues
    };
  }

  private async storeComplianceReport(report: ConsentReport) {
    // await this.prisma.complianceReport.create({
    //   data: {
    //     patientId: report.patientId,
    //     reportDate: new Date(),
    //     reportData: report as any,
    //     gdprCompliant: report.gdprCompliance.isCompliant,
    //     hipaaCompliant: report.hipaaCompliance.isCompliant,
    //     issues: report.gdprCompliance.issues.length + report.hipaaCompliance.issues.length
    //   }
    // });
    // Không có complianceReport trong schema
    return;
  }

  private isConsentPurposeValid(purpose: string): boolean {
    const validPurposes = [
      'TREATMENT',
      'PAYMENT',
      'HEALTHCARE_OPERATIONS',
      'RESEARCH',
      'PUBLIC_HEALTH',
      'LEGAL_REQUIREMENT'
    ];
    return validPurposes.includes(purpose.toUpperCase());
  }

  private async checkDataMinimization(patientId: number) {
    // const profile = await this.prisma.patientProfile.findUnique({
    //   where: { profileId: patientId },
    //   include: {
    //     telemetry: true,
    //     accessLogs: true
    //   }
    // });
    // TODO: Add logic to identify redundant/unnecessary fields.
    const excessiveFields: string[] = [];
    return {
      compliant: excessiveFields.length === 0,
      excessiveFields
    };
  }

  private async checkStorageCompliance(patientId: number) {
    // TODO: Add logic to check retention duration, encrypted storage, etc.
    return {
      compliant: true,
      affectedData: []
    };
  }

  private async checkPrivacyRuleCompliance(patientId: number, accessLogs: AccessLogSummary[]) {
    const issues: ComplianceIssue[] = [];

    const unnecessaryAccesses = accessLogs.filter(log =>
      !this.isAccessNecessary(log.accessedBy.role, log.dataType)
    );

    if (unnecessaryAccesses.length > 0) {
      issues.push({
        type: 'PRIVACY',
        severity: 'HIGH',
        description: 'Unnecessary data access detected',
        recommendation: 'Review and restrict access based on role',
        regulation: 'HIPAA Privacy Rule - Minimum Necessary Standard',
        affectedData: unnecessaryAccesses.map(a => a.dataType)
      });
    }

    return {
      compliant: issues.length === 0,
      issues
    };
  }

  private async checkSecurityRuleCompliance(patientId: number) {
    // TODO: Add security compliance logic (e.g., encrypted data, MFA, etc.)
    return {
      compliant: true,
      issues: []
    };
  }

  private checkBusinessAssociates(consents: ConsentSummary[]) {
    const requiredAssociates = ['THIRD_PARTY_LAB', 'EXTERNAL_SPECIALIST', 'INSURANCE_PROVIDER'];
    const missingAgreements: string[] = [];

    // TODO: Add real validation logic

    return {
      compliant: missingAgreements.length === 0,
      missingAgreements
    };
  }

  private isAccessNecessary(role: string, dataType: string): boolean {
    const accessMatrix = {
      DOCTOR: ['MEDICAL_HISTORY', 'LAB_RESULTS', 'PRESCRIPTIONS', 'VITALS'],
      NURSE: ['VITALS', 'MEDICATIONS', 'ALLERGIES'],
      ADMIN: ['DEMOGRAPHICS', 'INSURANCE'],
      RESEARCHER: ['ANONYMIZED_DATA']
    };

    return accessMatrix[role]?.includes(dataType) ?? false;
  }
}
