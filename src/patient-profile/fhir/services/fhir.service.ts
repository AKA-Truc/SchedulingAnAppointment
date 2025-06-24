import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { MongoPrismaService } from '../../../prisma/mongo-prisma.service';
import { PatientFHIRMapper } from '../patient-fhir.mapper';
import { FHIRPatient, FHIRObservation, FHIRCondition } from '../interfaces/fhir-resources.interface';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class FHIRService {
    private readonly externalFHIRServerUrl: string;

    constructor(
        private prisma: PrismaService,
        private mongoPrisma: MongoPrismaService,
        private patientMapper: PatientFHIRMapper,
        configService: ConfigService
    ) {
        const url = configService.get<string>('FHIR_SERVER_URL');
        if (!url) throw new Error('FHIR_SERVER_URL environment variable is not configured');
        this.externalFHIRServerUrl = url;
    }

    // -------------------- Patient --------------------
    async getPatient(id: string): Promise<FHIRPatient> {
        const profile = await this.prisma.patientProfile.findUnique({
            where: { profileId: +id }
        });
        if (!profile) throw new NotFoundException(`Patient ${id} not found`);
        return this.patientMapper.mapToFHIR(profile);
    }

    async searchPatients(params: any): Promise<FHIRPatient[]> {
        const { gender, birthDate } = params;
        const profiles = await this.prisma.patientProfile.findMany({
            where: {
                ...(gender && { gender }),
                ...(birthDate && { dateOfBirth: new Date(birthDate) }),
            }
        });
        return profiles.map(p => this.patientMapper.mapToFHIR(p));
    }

    // -------------------- Observation --------------------
    async createObservation(obs: FHIRObservation): Promise<FHIRObservation> {
        const response = await axios.post<FHIRObservation>(`${this.externalFHIRServerUrl}/Observation`, obs, {
            headers: { 'Content-Type': 'application/fhir+json' }
        });

        const observation = response.data;

        await this.mongoPrisma.fHIRResource.create({
            data: {
                resourceType: 'Observation',
                resourceId: observation.id ?? '',
                versionId: '1',
                source: 'internal',
                patientId: obs.subject.reference.split('/')[1],
                resourceData: JSON.parse(JSON.stringify(observation))
            }
        });

        return observation;
    }

    async getObservation(id: string): Promise<FHIRObservation> {
        interface MongoFindResult<T> {
            cursor?: {
                firstBatch?: T[];
            };
            ok?: number;
        }

        const result = await this.mongoPrisma.$runCommandRaw({
            find: 'FHIRResource',
            filter: {
                resourceType: 'Observation',
                isDeleted: false,
                'resourceData.id': id
            },
            limit: 1
        }) as MongoFindResult<{ resourceData: FHIRObservation }>;

        const local = result.cursor?.firstBatch?.[0];
        if (local) return local.resourceData;

        const response = await axios.get<FHIRObservation>(`${this.externalFHIRServerUrl}/Observation/${id}`, {
            headers: { 'Accept': 'application/fhir+json' }
        });

        return response.data;
    }

    async searchObservations(patientId: string): Promise<FHIRObservation[]> {
        const response = await axios.get<any>(`${this.externalFHIRServerUrl}/Observation`, {
            params: { subject: `Patient/${patientId}` },
            headers: { Accept: 'application/fhir+json' }
        });
        return response.data.entry?.map((e: any) => e.resource as FHIRObservation) || [];
    }

    // -------------------- Condition --------------------
    async createCondition(cond: FHIRCondition): Promise<FHIRCondition> {
        const response = await axios.post<FHIRCondition>(`${this.externalFHIRServerUrl}/Condition`, cond, {
            headers: { 'Content-Type': 'application/fhir+json' }
        });
        return response.data;
    }

    async getCondition(id: string): Promise<FHIRCondition> {
        const response = await axios.get<FHIRCondition>(`${this.externalFHIRServerUrl}/Condition/${id}`, {
            headers: { Accept: 'application/fhir+json' }
        });
        return response.data;
    }

    async searchConditions(patientId: string): Promise<FHIRCondition[]> {
        const response = await axios.get<any>(`${this.externalFHIRServerUrl}/Condition`, {
            params: { subject: `Patient/${patientId}` },
            headers: { Accept: 'application/fhir+json' }
        });
        return response.data.entry?.map((e: any) => e.resource as FHIRCondition) || [];
    }

    // -------------------- Sync --------------------
    async syncPatientWithExternalSystem(patientId: string): Promise<void> {
        try {
            const localPatient = await this.getPatient(patientId);
            await axios.put(`${this.externalFHIRServerUrl}/Patient/${patientId}`, localPatient, {
                headers: { 'Content-Type': 'application/fhir+json' }
            });

            const observations = await this.searchObservations(patientId);
            const conditions = await this.searchConditions(patientId);

            for (const obs of observations) await this.createObservation(obs);
            for (const cond of conditions) await this.createCondition(cond);
        } catch (error) {
            console.error('Error syncing patient with external system:', error);
            throw error;
        }
    }
}
