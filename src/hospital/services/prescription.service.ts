import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePrescriptionItemDto } from '../DTO/CreatePrescriptionItem.dto';
import { UpdatePrescriptionItemDto } from '../DTO/UpdatePrescriptionItem.dto';
import { PrescriptionItem } from '@prisma/client';
import { CreatePrescriptionItemResponseDto } from '../DTO/CreatePrescriptionItem.dto';

@Injectable()
export class PrescriptionService {

    constructor(private readonly prisma: PrismaService) {}

    async createPrescriptionItem(data: CreatePrescriptionItemDto): Promise<CreatePrescriptionItemResponseDto> {
        const prescriptionItem = await this.prisma.prescriptionItem.create({
            data,
        });

        return {
            message: 'Prescription item created successfully',
            data: prescriptionItem,
        };
    }

    async getPrescriptionItemById(prescriptionItemId: number): Promise<PrescriptionItem> {
        const prescriptionItem = await this.prisma.prescriptionItem.findUnique({
            where: { itemId: prescriptionItemId },
        });

        if (!prescriptionItem) {
            throw new Error(`Prescription item with ID ${prescriptionItemId} not found`);
        }

        return prescriptionItem;
    }

    async updatePrescriptionItem(prescriptionItemId: number, data: UpdatePrescriptionItemDto): Promise<PrescriptionItem> {
        const prescriptionItem = await this.prisma.prescriptionItem.update({
            where: { itemId: prescriptionItemId },
            data,
        });

        return prescriptionItem;
    }

    async deletePrescriptionItem(prescriptionItemId: number): Promise<{ message: string }> {
        await this.prisma.prescriptionItem.delete({
            where: { itemId: prescriptionItemId },
        });

        return { message: 'Prescription item deleted successfully' };
    }

    async getAllPrescriptionItems(page: number = 1, limit: number = 10): Promise<{ data: PrescriptionItem[], meta: { total: number, page: number, lastPage: number } }> {
        const skip = (page - 1) * limit;

        const [data, total] = await this.prisma.$transaction([
            this.prisma.prescriptionItem.findMany({
                skip,
                take: limit,
                orderBy: { itemId: 'desc' },
            }),
            this.prisma.prescriptionItem.count(),
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

