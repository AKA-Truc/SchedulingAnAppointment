import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Producer, Consumer, EachMessagePayload } from 'kafkajs';
import { TelemetryData, AnomalyAlert, MetricThresholds } from '../interfaces/telemetry.interface';

@Injectable()
export class TelemetryKafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly kafka: Kafka;
  private readonly producer: Producer;
  private readonly consumer: Consumer;
  private readonly streamConsumer: Consumer;

  private readonly thresholds: MetricThresholds = {
    heartRate: { min: 60, max: 100 },
    bloodPressure: {
      systolic: { min: 90, max: 140 },
      diastolic: { min: 60, max: 90 }
    },
    spO2: { min: 95, max: 100 },
    temperature: { min: 36.1, max: 37.2 },
    glucoseLevel: { min: 70, max: 140 }
  };

  constructor() {
    this.kafka = new Kafka({
      clientId: 'patient-telemetry',
      brokers: ['localhost:9092'] // Configure from env
    });

    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: 'telemetry-alerts' });
    this.streamConsumer = this.kafka.consumer({ groupId: 'telemetry-stream' });
  }

  async onModuleInit() {
    await this.producer.connect();
    await this.consumer.connect();
    await this.streamConsumer.connect();

    await this.consumer.subscribe({ topic: 'patient-telemetry', fromBeginning: true });
    await this.streamConsumer.subscribe({ topic: 'patient-telemetry-stream', fromBeginning: true });

    await this.startStreamProcessing();
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
    await this.consumer.disconnect();
    await this.streamConsumer.disconnect();
  }

  async publishTelemetryData(data: TelemetryData) {
    const message = {
      key: data.patientId.toString(),
      value: JSON.stringify(data)
    };

    await this.producer.send({ topic: 'patient-telemetry', messages: [message] });
    await this.producer.send({ topic: 'patient-telemetry-stream', messages: [message] });
  }

  async publishAlert(alert: AnomalyAlert) {
    await this.producer.send({
      topic: 'patient-alerts',
      messages: [{
        key: alert.patientId.toString(),
        value: JSON.stringify(alert)
      }]
    });
  }

  private async startStreamProcessing() {
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
        const raw = message.value?.toString();
        if (!raw) return;

        const telemetryData: TelemetryData = JSON.parse(raw);
        await this.processMetrics(telemetryData);
      }
    });

    await this.streamConsumer.run({
      eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
        const raw = message.value?.toString();
        if (!raw) return;

        const data: TelemetryData = JSON.parse(raw);
        await this.detectAnomalies(data);
      }
    });
  }

  private async processMetrics(data: TelemetryData) {
    if (data.metrics.heartRate) {
      const alert = this.checkThreshold(
        'heartRate',
        data.metrics.heartRate,
        this.thresholds.heartRate,
        data
      );
      if (alert) await this.publishAlert(alert);
    }

    if (data.metrics.bloodPressure) {
      const systolicAlert = this.checkThreshold(
        'systolic',
        data.metrics.bloodPressure.systolic,
        this.thresholds.bloodPressure.systolic,
        data
      );
      if (systolicAlert) await this.publishAlert(systolicAlert);

      const diastolicAlert = this.checkThreshold(
        'diastolic',
        data.metrics.bloodPressure.diastolic,
        this.thresholds.bloodPressure.diastolic,
        data
      );
      if (diastolicAlert) await this.publishAlert(diastolicAlert);
    }

    if (data.metrics.spO2) {
      const alert = this.checkThreshold(
        'spO2',
        data.metrics.spO2,
        this.thresholds.spO2,
        data
      );
      if (alert) await this.publishAlert(alert);
    }
  }

  private async detectAnomalies(data: TelemetryData) {
    const anomalies = await this.runAnomalyDetection(data);
    for (const anomaly of anomalies) {
      await this.publishAlert(anomaly);
    }
  }

  private async runAnomalyDetection(data: TelemetryData): Promise<AnomalyAlert[]> {
    const anomalies: AnomalyAlert[] = [];

    if (data.metrics.heartRate) {
      const isAnomaly = await this.detectHeartRateAnomaly(data.patientId, data.metrics.heartRate);
      if (isAnomaly) {
        anomalies.push({
          patientId: data.patientId,
          deviceId: data.deviceId,
          metricType: 'heartRate',
          value: data.metrics.heartRate,
          threshold: this.thresholds.heartRate.max,
          severity: 'HIGH',
          timestamp: new Date()
        });
      }
    }

    return anomalies;
  }

  private checkThreshold(
    metricType: string,
    value: number,
    threshold: { min: number; max: number },
    data: TelemetryData
  ): AnomalyAlert | null {
    if (value < threshold.min || value > threshold.max) {
      return {
        patientId: data.patientId,
        deviceId: data.deviceId,
        metricType,
        value,
        threshold: value < threshold.min ? threshold.min : threshold.max,
        severity: this.calculateSeverity(value, threshold),
        timestamp: new Date()
      };
    }
    return null;
  }

  private calculateSeverity(
    value: number,
    threshold: { min: number; max: number }
  ): 'LOW' | 'MEDIUM' | 'HIGH' {
    const minDiff = Math.abs(value - threshold.min);
    const maxDiff = Math.abs(value - threshold.max);
    const diff = Math.min(minDiff, maxDiff);

    if (diff > (threshold.max - threshold.min) * 0.5) return 'HIGH';
    if (diff > (threshold.max - threshold.min) * 0.2) return 'MEDIUM';
    return 'LOW';
  }

  private async detectHeartRateAnomaly(patientId: number, currentRate: number): Promise<boolean> {
    const movingAverage = 75;
    const standardDeviation = 10;
    const zScore = Math.abs(currentRate - movingAverage) / standardDeviation;

    return zScore > 2;
  }
}
