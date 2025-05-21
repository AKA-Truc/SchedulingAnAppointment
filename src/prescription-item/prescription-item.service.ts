import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePrescriptionItem, UpdatePrescriptionItem } from './DTO';

@Injectable()
export class PrescriptionItemService {
    constructor(private readonly prisma: PrismaService) { }

    async createPrescriptionItem(dto: CreatePrescriptionItem) {
        const item = await this.prisma.prescriptionItem.create({
            data: { ...dto },
        });

        return {
            message: 'Tạo mục đơn thuốc thành công',
            item,
        };
    }

    async getAllPrescriptionItems(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.prisma.prescriptionItem.findMany({
                skip,
                take: limit,
                include: { medicalRecord: true },
            }),
            this.prisma.prescriptionItem.count(),
        ]);
        return {
            data: items,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getPrescriptionItemById(id: number) {
        const item = await this.prisma.prescriptionItem.findUnique({
            where: { itemId: id },
            include: { medicalRecord: true },
        });
        if (!item) {
            throw new NotFoundException(`Không tìm thấy mục đơn thuốc với ID ${id}`);
        }
        return item;
    }

    async updatePrescriptionItem(id: number, dto: UpdatePrescriptionItem) {
        const item = await this.prisma.prescriptionItem.findUnique({
            where: { itemId: id },
        });
        if (!item) {
            throw new NotFoundException(`Không tìm thấy mục đơn thuốc với ID ${id}`);
        }

        return this.prisma.prescriptionItem.update({
            where: { itemId: id },
            data: { ...dto },
        });
    }

    async deletePrescriptionItem(id: number) {
        const item = await this.prisma.prescriptionItem.findUnique({
            where: { itemId: id },
        });
        if (!item) {
            throw new NotFoundException(`Không tìm thấy mục đơn thuốc với ID ${id}`);
        }

        return this.prisma.prescriptionItem.delete({
            where: { itemId: id },
        });
    }
}
