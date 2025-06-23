export interface ConsentReport {
  patientId: number;
  period: {
    start: Date;
    end: Date;
  };
  activeConsents: ConsentSummary[];
  revokedConsents: ConsentSummary[];
  dataAccesses: AccessLogSummary[];
  gdprCompliance: GDPRComplianceStatus;
  hipaaCompliance: HIPAAComplianceStatus;
}

export interface ConsentSummary {
  id: number;
  grantedTo: {
    userId: number;
    role: string;
    name: string;
  };
  dataType: string;
  purpose: string;
  validFrom: Date;
  validUntil: Date;
  status: 'ACTIVE' | 'REVOKED';
  revokedAt?: Date;
}

export interface AccessLogSummary {
  id: number;
  accessedBy: {
    userId: number;
    role: string;
    name: string;
  };
  dataType: string;
  purpose: string;
  timestamp: Date;
  consentId: number | null; // Null if access was not based on a consent
}

export interface GDPRComplianceStatus {
  isCompliant: boolean;
  validConsents: boolean;
  dataMinimization: boolean;
  storageCompliance: boolean;
  crossBorderTransfers: boolean;
  issues: ComplianceIssue[];
}

export interface HIPAAComplianceStatus {
  isCompliant: boolean;
  privacyRule: boolean;
  securityRule: boolean;
  breachNotification: boolean;
  businessAssociates: boolean;
  issues: ComplianceIssue[];
}

export interface ComplianceIssue {
  type: 'CONSENT' | 'ACCESS' | 'STORAGE' | 'SECURITY' | 'PRIVACY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  recommendation: string;
  regulation: string;
  affectedData: string[];
}
