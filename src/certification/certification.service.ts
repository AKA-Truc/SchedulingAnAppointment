import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCertification, UpdateCertification } from './DTO';

@Injectable()
export class CertificationService {
    constructor(private prisma: PrismaService) { }

    //tạo chứng chỉ (bên trong đã có kiểm tra tồn tại của doctor trước khi connect với doctor)
    async create(dto: CreateCertification) {
        // Kiểm tra doctorId có tồn tại không
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

    //Tìm tất cả chứng chỉ (đã phân trang)
    async findAll(page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;

        const [data, total] = await this.prisma.$transaction([
            this.prisma.certification.findMany({
                skip,
                take: limit,
                include: { doctor: true },
                orderBy: { certificationId: 'asc' }, // Có thể sửa thành trường khác nếu muốn
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

    //Tìm 1 chứng chỉ
    async findOne(id: number) {
        const cert = await this.prisma.certification.findUnique({
            where: { certificationId: id },
            include: { doctor: true },
        });

        if (!cert) throw new NotFoundException('Certification not found');
        return cert;
    }


    //Cập nhật chứng chỉ (đã có kiểm tra tồn tại của đầu vào và kiểm tra Doctor tồn tại trong db trước khi cập nhật)
    async update(id: number, dto: UpdateCertification) {
        const updateData: any = {};

        updateData.fileUrl = dto.fileUrl;

        if (dto.doctorId) {
            const doctorExists = await this.prisma.doctor.findUnique({
                where: { doctorId: dto.doctorId },
            });

            if (!doctorExists) {
                throw new NotFoundException(`Doctor with ID ${dto.doctorId} does not exist`);
            }

            if (dto.doctorId) {
                updateData.Doctor = {
                    connect: { doctorId: dto.doctorId },
                };
            }
        }

        return this.prisma.certification.update({
            where: { certificationId: id },
            data: updateData,
        });
    }

    //Xóa bỏ 1 chứng chỉ
    async remove(id: number) {
        return this.prisma.certification.delete({
            where: { certificationId: id },
        });
    }
}

