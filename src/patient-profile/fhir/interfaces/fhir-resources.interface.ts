export interface FHIRResource {
  resourceType: string;
  id?: string;
  meta?: {
    versionId?: string;
    lastUpdated?: string;
  };
}

export interface FHIRPatient extends FHIRResource {
  resourceType: 'Patient';
  active?: boolean;
  name?: Array<{
    use?: string;
    text?: string;
    family?: string;
    given?: string[];
  }>;
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  address?: Array<{
    use?: string;
    text?: string;
    line?: string[];
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  }>;
  telecom?: Array<{
    system?: string;
    value?: string;
    use?: string;
  }>;
  extension?: Array<{
    url: string;
    valueString?: string;
    extension?: Array<{
      url: string;
      valueString?: string;
    }>;
  }>;
}

export interface FHIRObservation extends FHIRResource {
  resourceType: 'Observation';
  status: 'registered' | 'preliminary' | 'final' | 'amended';
  category?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  code: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  subject: {
    reference: string;
    display?: string;
  };
  effectiveDateTime?: string;
  valueQuantity?: {
    value: number;
    unit: string;
    system?: string;
    code?: string;
  };
  valueString?: string;
  valueCodeableConcept?: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
}

export interface FHIRCondition extends FHIRResource {
  resourceType: 'Condition';
  clinicalStatus?: {
    coding: Array<{
      system: string;
      code: 'active' | 'recurrence' | 'relapse' | 'inactive' | 'remission' | 'resolved';
      display: string;
    }>;
  };
  verificationStatus?: {
    coding: Array<{
      system: string;
      code: 'unconfirmed' | 'provisional' | 'differential' | 'confirmed' | 'refuted' | 'entered-in-error';
      display: string;
    }>;
  };
  code: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  subject: {
    reference: string;
    display?: string;
  };
  onsetDateTime?: string;
  abatementDateTime?: string;
  recordedDate?: string;
  severity?: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  bodySite?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  note?: Array<{
    text: string;
  }>;
}
