import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMedicalRecord, UpdateMedicalRecord } from './DTO';

@Injectable()
export class MedicalRecordService {
    constructor(private readonly prisma: PrismaService) { }

    async createMedicalRecord(dto: CreateMedicalRecord) {
        // Kiểm tra xem Appointment_ID đã tồn tại MedicalRecord chưa (vì unique)
        const exists = await this.prisma.medicalRecord.findUnique({
            where: { Appointment_ID: dto.Appointment_ID },
        });
        if (exists) {
            throw new BadRequestException('Bản ghi y tế cho cuộc hẹn này đã tồn tại.');
        }

        const record = await this.prisma.medicalRecord.create({
            data: { ...dto },
        });

        return {
            message: 'Tạo bản ghi y tế thành công',
            record,
        };
    }

    async getAllMedicalRecords(page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const [records, total] = await Promise.all([
            this.prisma.medicalRecord.findMany({
                skip,
                take: limit,
                include: {
                    appointment: true,
                    prescriptions: true,
                },
            }),
            this.prisma.medicalRecord.count(),
        ]);

        return {
            data: records,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getMedicalRecordById(id: number) {
        const record = await this.prisma.medicalRecord.findUnique({
            where: { MedicalRecord_ID: id },
            include: {
                appointment: true,
                prescriptions: true,
            },
        });

        if (!record) {
            throw new NotFoundException(`Không tìm thấy bản ghi y tế với ID ${id}`);
        }

        return record;
    }

    async updateMedicalRecord(id: number, dto: UpdateMedicalRecord) {
        const record = await this.prisma.medicalRecord.findUnique({
            where: { MedicalRecord_ID: id },
        });
        if (!record) {
            throw new NotFoundException(`Không tìm thấy bản ghi y tế với ID ${id}`);
        }

        // Nếu cập nhật Appointment_ID thì kiểm tra trùng
        if (dto.Appointment_ID && dto.Appointment_ID !== record.Appointment_ID) {
            const appointmentTaken = await this.prisma.medicalRecord.findUnique({
                where: { Appointment_ID: dto.Appointment_ID },
            });
            if (appointmentTaken) {
                throw new BadRequestException('Bản ghi y tế cho cuộc hẹn này đã tồn tại.');
            }
        }

        return this.prisma.medicalRecord.update({
            where: { MedicalRecord_ID: id },
            data: { ...dto },
        });
    }

    async deleteMedicalRecord(id: number) {
        const record = await this.prisma.medicalRecord.findUnique({
            where: { MedicalRecord_ID: id },
        });
        if (!record) {
            throw new NotFoundException(`Không tìm thấy bản ghi y tế với ID ${id}`);
        }

        return this.prisma.medicalRecord.delete({
            where: { MedicalRecord_ID: id },
        });
    }
}
