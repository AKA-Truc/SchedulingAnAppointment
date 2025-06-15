import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAchievement, UpdateAchievement } from '../DTO';

@Injectable()
export class AchievementService {
    constructor(private prisma: PrismaService) { }

    // 🟢 Tạo thành tích - kiểm tra doctor & hospital tồn tại trước khi kết nối
    async create(dto: CreateAchievement) {
        if (dto.doctorId) {
            const doctorExists = await this.prisma.doctor.findUnique({
                where: { doctorId: dto.doctorId },
            });
            if (!doctorExists) {
                throw new NotFoundException(`Doctor with ID ${dto.doctorId} does not exist`);
            }
        }

        if (dto.hospitalId) {
            const hospitalExists = await this.prisma.hospital.findUnique({
                where: { hospitalId: dto.hospitalId },
            });
            if (!hospitalExists) {
                throw new NotFoundException(`Hospital with ID ${dto.hospitalId} does not exist`);
            }
        }

        return this.prisma.achievement.create({
            data: {
                title: dto.title,
                description: dto.description,
                dateAchieved: dto.dateAchieved,
                doctor: dto.doctorId ? { connect: { doctorId: dto.doctorId } } : undefined,
                hospital: dto.hospitalId ? { connect: { hospitalId: dto.hospitalId } } : undefined,
            },
        });
    }

    // 📄 Lấy tất cả thành tích (có phân trang)
    async findAll(page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const [data, total] = await this.prisma.$transaction([
            this.prisma.achievement.findMany({
                skip,
                take: limit,
                orderBy: { achievementId: 'asc' },
                include: {
                    doctor: { include: { user: true } },
                    hospital: true,
                },
            }),
            this.prisma.achievement.count(),
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

    // 🔍 Lấy một thành tích theo ID
    async findOne(id: number) {
        const achievement = await this.prisma.achievement.findUnique({
            where: { achievementId: id },
            include: {
                doctor: { include: { user: true } },
                hospital: true,
            },
        });

        if (!achievement) {
            throw new NotFoundException(`Achievement with ID ${id} not found`);
        }

        return achievement;
    }

    // ✏️ Cập nhật thành tích
    async update(id: number, dto: UpdateAchievement) {
        const achievement = await this.prisma.achievement.findUnique({
            where: { achievementId: id },
        });

        if (!achievement) {
            throw new NotFoundException(`Achievement with ID ${id} not found`);
        }

        const updateData: any = {};

        if (dto.title !== undefined) updateData.title = dto.title;
        if (dto.description !== undefined) updateData.description = dto.description;
        if (dto.dateAchieved !== undefined) updateData.dateAchieved = dto.dateAchieved;

        if (dto.doctorId) {
            const doctorExists = await this.prisma.doctor.findUnique({
                where: { doctorId: dto.doctorId },
            });
            if (!doctorExists) {
                throw new NotFoundException(`Doctor with ID ${dto.doctorId} does not exist`);
            }
            updateData.doctor = { connect: { doctorId: dto.doctorId } };
        }

        if (dto.hospitalId) {
            const hospitalExists = await this.prisma.hospital.findUnique({
                where: { hospitalId: dto.hospitalId },
            });
            if (!hospitalExists) {
                throw new NotFoundException(`Hospital with ID ${dto.hospitalId} does not exist`);
            }
            updateData.hospital = { connect: { hospitalId: dto.hospitalId } };
        }

        return this.prisma.achievement.update({
            where: { achievementId: id },
            data: updateData,
            include: {
                doctor: { include: { user: true } },
                hospital: true,
            },
        });
    }

    // ❌ Xoá thành tích
    async remove(id: number) {
        const achievement = await this.prisma.achievement.findUnique({
            where: { achievementId: id },
        });

        if (!achievement) {
            throw new NotFoundException(`Achievement with ID ${id} not found`);
        }

        return this.prisma.achievement.delete({
            where: { achievementId: id },
            include: {
                doctor: true,
                hospital: true,
            },
        });
    }
}
