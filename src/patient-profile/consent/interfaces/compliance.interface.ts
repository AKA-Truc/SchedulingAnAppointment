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
  consentType: string;
  status: string;
  startDate: Date;
  endDate: Date | null;
  scope: string[];
  terms: string;
  witness?: string | null;
  witnessContact?: string | null;
  createdAt: Date;
  updatedAt: Date;
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
