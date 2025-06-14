import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateMedicalRecordDto } from "../DTO/CreateMedicalRecord.dto";
import { UpdateMedicalRecordDto } from "../DTO/UpdateMedicalRecord.dto";
import { MedicalRecord } from "@prisma/client";
import { CreateMedicalRecordResponseDto } from "../DTO/CreateMedicalRecord.dto";

@Injectable()
export class MedicalRecordService {

    constructor(private readonly prisma: PrismaService) {}

    async createMedicalRecord(data: CreateMedicalRecordDto): Promise<CreateMedicalRecordResponseDto> {
        const medicalRecord = await this.prisma.medicalRecord.create({
            data,
        });

        return {
            message: "Medical record created successfully",
            medicalRecord,
        };
    }

    async getMedicalRecordById(medicalRecordId: number): Promise<MedicalRecord> {
        const medicalRecord = await this.prisma.medicalRecord.findUnique({
            where: { medicalRecordId },
        });

        if (!medicalRecord) {
            throw new Error(`Medical record with ID ${medicalRecordId} not found`);
        }

        return medicalRecord;
    }

    async updateMedicalRecord(medicalRecordId: number, data: UpdateMedicalRecordDto): Promise<MedicalRecord> {
        const medicalRecord = await this.prisma.medicalRecord.update({
            where: { medicalRecordId },
            data,
        });

        return medicalRecord;
    }

    async deleteMedicalRecord(medicalRecordId: number): Promise<{ message: string }> {
        await this.prisma.medicalRecord.delete({
            where: { medicalRecordId },
        });

        return { message: "Medical record deleted successfully" };
    }

    async getAllMedicalRecords(page: number = 1, limit: number = 10): Promise<{ data: MedicalRecord[], meta: { total: number, page: number, lastPage: number } }> {
        const skip = (page - 1) * limit;

        const [data, total] = await this.prisma.$transaction([
            this.prisma.medicalRecord.findMany({
                skip,
                take: limit,
                orderBy: { medicalRecordId: 'desc' },
            }),
            this.prisma.medicalRecord.count(),
        ]);

        return {
            data,
            meta: {
                total,
                page,
                lastPage: Math.ceil(total / limit),
            },
        };
    }
    
}
