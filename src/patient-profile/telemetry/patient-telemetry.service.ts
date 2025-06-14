import { Injectable } from '@nestjs/common';
import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { PrismaService } from 'src/prisma/prisma.service';

@WebSocketGateway({
  namespace: 'patient-telemetry',
})
@Injectable()
export class PatientTelemetryService {
  constructor(private readonly prisma: PrismaService) {}

  @SubscribeMessage('health-data')
  async handleHealthData(@MessageBody() data: {
    patientId: number;
    deviceId: string;
    metrics: {
      heartRate?: number;
      bloodPressure?: {
        systolic: number;
        diastolic: number;
      };
      spO2?: number;
      temperature?: number;
      timestamp: Date;
    }
  }) {
    // Store telemetry data
    await this.prisma.patientTelemetry.create({
      data: {
        patientId: data.patientId,
        deviceId: data.deviceId,
        metricType: this.getMetricType(data.metrics),
        value: JSON.stringify(data.metrics),
        timestamp: data.metrics.timestamp
      }
    });

    // Check for anomalies
    await this.analyzeMetrics(data);
  }

  private getMetricType(metrics: any): string {
    if (metrics.heartRate) return 'HEART_RATE';
    if (metrics.bloodPressure) return 'BLOOD_PRESSURE';
    if (metrics.spO2) return 'SPO2';
    if (metrics.temperature) return 'TEMPERATURE';
    return 'OTHER';
  }

  private async analyzeMetrics(data: any) {
    // Implement real-time analysis using Kafka
    // Example: Detect abnormal heart rate
    if (data.metrics.heartRate) {
      const isAbnormal = this.detectAbnormalHeartRate(
        data.metrics.heartRate,
        data.patientId
      );

      if (isAbnormal) {
        await this.createAlert({
          patientId: data.patientId,
          type: 'ABNORMAL_HEART_RATE',
          value: data.metrics.heartRate,
          timestamp: data.metrics.timestamp
        });
      }
    }
  }

  private async createAlert(alert: {
    patientId: number;
    type: string;
    value: any;
    timestamp: Date;
  }) {
    await this.prisma.patientAlert.create({
      data: {
        patientId: alert.patientId,
        alertType: alert.type,
        value: JSON.stringify(alert.value),
        timestamp: alert.timestamp,
        status: 'PENDING'
      }
    });
  }

  private detectAbnormalHeartRate(heartRate: number, patientId: number): boolean {
    // Implement anomaly detection logic
    // This is a simple example - real implementation would be more sophisticated
    return heartRate < 40 || heartRate > 150;
  }
}
