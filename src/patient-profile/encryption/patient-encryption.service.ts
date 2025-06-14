import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // cập nhật path nếu khác
import * as seal from 'node-seal'; // Homomorphic encryption library

@Injectable()
export class PatientEncryptionService {
  private readonly sensitiveFields = [
    'allergies',
    'chronicDiseases',
    'obstetricHistory',
    'surgicalHistory',
    'medicationHistory'
  ];

  constructor(private readonly prisma: PrismaService) {}

  async encryptSensitiveData(data: any) {
    const encryptedData = { ...data };
    
    for (const field of this.sensitiveFields) {
      if (data[field]) {
        encryptedData[field] = await this.encryptField(data[field]);
      }
    }
    
    return encryptedData;
  }

  async aggregateEncryptedData(patientIds: number[], field: string) {
  const patients = await this.prisma.patientProfile.findMany({
    where: {
      profileId: { in: patientIds }
    },
    select: {
      [field]: true
    }
  });

  const values = (patients as Array<Record<string, any>>)
    .map(p => p[field])
    .filter((v): v is string => typeof v === 'string');

  return await this.computeEncryptedAggregation(values);
}



  private async encryptField(value: string): Promise<string> {
    return `encrypted(${value})`; 
  }

  private async computeEncryptedAggregation(encryptedValues: string[]) {
    return {
      total: encryptedValues.length,
      aggregatedResult: 'encrypted_result'
    };
  }
}
