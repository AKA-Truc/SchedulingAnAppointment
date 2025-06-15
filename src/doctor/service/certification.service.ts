import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCertification, UpdateCertification } from '../DTO';

@Injectable()
export class CertificationService {
    constructor(private prisma: PrismaService) { }

    // 🟢 Tạo chứng chỉ - kiểm tra doctor trước khi kết nối
    async create(dto: CreateCertification) {
        const doctorExists = await this.prisma.doctor.findUnique({
            where: { doctorId: dto.doctorId },
        });

        if (!doctorExists) {
            throw new NotFoundException(`Doctor with ID ${dto.doctorId} does not exist`);
        }

        return this.prisma.certification.create({
            data: {
                fileUrl: dto.fileUrl,
                doctor: {
                    connect: { doctorId: dto.doctorId },
                },
            },
        });
    }

    // 📄 Lấy tất cả chứng chỉ (có phân trang)
    async findAll(page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const [data, total] = await this.prisma.$transaction([
            this.prisma.certification.findMany({
                skip,
                take: limit,
                include: { doctor: true },
                orderBy: { certificationId: 'asc' },
            }),
            this.prisma.certification.count(),
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

    // 🔍 Lấy một chứng chỉ theo ID
    async findOne(id: number) {
        const cert = await this.prisma.certification.findUnique({
            where: { certificationId: id },
            include: { doctor: true },
        });

        if (!cert) {
            throw new NotFoundException('Certification not found');
        }

        return cert;
    }

    // ✏️ Cập nhật chứng chỉ
    async update(id: number, dto: UpdateCertification) {
        const cert = await this.prisma.certification.findUnique({
            where: { certificationId: id },
        });

        if (!cert) {
            throw new NotFoundException(`Certification with ID ${id} not found`);
        }

        const updateData: any = {
            fileUrl: dto.fileUrl,
        };

        if (dto.doctorId) {
            const doctorExists = await this.prisma.doctor.findUnique({
                where: { doctorId: dto.doctorId },
            });

            if (!doctorExists) {
                throw new NotFoundException(`Doctor with ID ${dto.doctorId} does not exist`);
            }

            updateData.doctor = {
                connect: { doctorId: dto.doctorId },
            };
        }

        return this.prisma.certification.update({
            where: { certificationId: id },
            data: updateData,
            include: { doctor: true },
        });
    }

    // ❌ Xoá chứng chỉ
    async remove(id: number) {
        const cert = await this.prisma.certification.findUnique({
            where: { certificationId: id },
        });

        if (!cert) {
            throw new NotFoundException(`Certification with ID ${id} not found`);
        }

        return this.prisma.certification.delete({
            where: { certificationId: id },
        });
    }
}
