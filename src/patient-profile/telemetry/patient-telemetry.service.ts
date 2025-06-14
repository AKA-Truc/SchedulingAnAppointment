import { Injectable, OnModuleInit } from '@nestjs/common';
import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { TelemetryKafkaService } from './services/telemetry-kafka.service';
import { TelemetryData, HealthMetric } from './interfaces/telemetry.interface';
import mqtt, { MqttClient } from 'mqtt';

@WebSocketGateway({
  namespace: 'patient-telemetry',
  cors: true
})
@Injectable()
export class PatientTelemetryService implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  private mqttClient: MqttClient;

  constructor(
    private readonly prisma: PrismaService,
    private readonly kafkaService: TelemetryKafkaService
  ) {}

  async onModuleInit() {
    const mqttUrl = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
    this.mqttClient = mqtt.connect(mqttUrl);

    this.mqttClient.on('connect', () => {
      this.mqttClient.subscribe('wearables/+/telemetry', (err) => {
        if (err) {
          console.error('MQTT Subscribe error:', err);
        }
      });
    });

    this.mqttClient.on('message', async (topic, message) => {
      try {
        const deviceId = topic.split('/')[1];
        const data = JSON.parse(message.toString());
        await this.handleDeviceTelemetry(deviceId, data);
      } catch (error) {
        console.error('Error processing MQTT message:', error);
      }
    });
  }

  @SubscribeMessage('health-data')
  async handleHealthData(@MessageBody() data: TelemetryData) {
    try {
      const metricType = this.getMetricType(data.metrics);

      // Save to DB
      await this.prisma.patientTelemetry.create({
        data: {
          patientId: data.patientId,
          deviceId: data.deviceId,
          metricType,
          value: JSON.stringify(data.metrics),
          timestamp: data.metrics.timestamp
        }
      });

      // Send to Kafka
      await this.kafkaService.publishTelemetryData(data);

      // Emit to WebSocket clients
      this.server.emit(`patient-${data.patientId}-telemetry`, data);

      // Real-time analysis (abnormal heart rate)
      if (data.metrics.heartRate !== undefined) {
        const isAbnormal = this.detectAbnormalHeartRate(data.metrics.heartRate);
        if (isAbnormal) {
          await this.createAlert({
            patientId: data.patientId,
            type: 'ABNORMAL_HEART_RATE',
            value: data.metrics.heartRate,
            timestamp: data.metrics.timestamp
          });
        }
      }
    } catch (error) {
      console.error('Error handling health data:', error);
      throw error;
    }
  }

  private async handleDeviceTelemetry(deviceId: string, rawData: any) {
    try {
      const telemetryData: TelemetryData = {
        deviceId,
        patientId: rawData.patientId,
        metrics: this.normalizeMetrics(rawData),
        deviceType: rawData.deviceType,
        batteryLevel: rawData.batteryLevel
      };

      await this.handleHealthData(telemetryData);
    } catch (error) {
      console.error('Error processing device telemetry:', error);
    }
  }

  private normalizeMetrics(rawData: any): HealthMetric {
    return {
      heartRate: rawData.hr ?? rawData.heartRate,
      bloodPressure: rawData.bp ?? rawData.bloodPressure,
      spO2: rawData.spo2 ?? rawData.oxygen,
      temperature: rawData.temp ?? rawData.temperature,
      glucoseLevel: rawData.glucose,
      timestamp: new Date(rawData.timestamp || Date.now())
    };
  }

  private getMetricType(metrics: HealthMetric): string {
    if (metrics.heartRate !== undefined) return 'HEART_RATE';
    if (metrics.bloodPressure !== undefined) return 'BLOOD_PRESSURE';
    if (metrics.spO2 !== undefined) return 'SPO2';
    if (metrics.temperature !== undefined) return 'TEMPERATURE';
    if (metrics.glucoseLevel !== undefined) return 'GLUCOSE';
    return 'OTHER';
  }

  private detectAbnormalHeartRate(heartRate: number): boolean {
    return heartRate < 40 || heartRate > 150;
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
}
