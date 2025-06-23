export interface HealthMetric {
  heartRate?: number;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  spO2?: number;
  temperature?: number;
  glucoseLevel?: number;
  timestamp: Date;
}

export interface TelemetryData {
  patientId: number;
  deviceId: string;
  metrics: HealthMetric;
  deviceType?: string;
  deviceLocation?: string;
  batteryLevel?: number;
}

export interface AnomalyAlert {
  patientId: number;
  deviceId: string;
  metricType: string;
  value: number;
  threshold: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  timestamp: Date;
}

export interface MetricThresholds {
  heartRate: {
    min: number;
    max: number;
  };
  bloodPressure: {
    systolic: { min: number; max: number };
    diastolic: { min: number; max: number };
  };
  spO2: {
    min: number;
    max: number;
  };
  temperature: {
    min: number;
    max: number;
  };
  glucoseLevel: {
    min: number;
    max: number;
  };
}
