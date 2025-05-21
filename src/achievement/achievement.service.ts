import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';

@Injectable()
export class AchievementService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateAchievementDto) {
        const achievement = await this.prisma.achievement.create({
            data: {
                title: dto.title,
                description: dto.description,
                dateAchieved: dto.dateAchieved,
                doctorId: dto.doctorId,
                hospitalId: dto.hospitalId,
            },
        });

        return {
            message: 'Achievement created successfully',
            achievement,
        };
    }

    async findAll(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [achievements, total] = await Promise.all([
            this.prisma.achievement.findMany({
                skip,
                take: limit,
                include: {
                    doctor: {
                        include: {
                            user: true,
                        },
                    },
                    hospital: true,
                },
            }),
            this.prisma.achievement.count(),
        ]);

        return {
            data: achievements,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: number) {
        const achievement = await this.prisma.achievement.findUnique({
            where: { achievementId: id },
            include: {
                doctor: {
                    include: {
                        user: true,
                    },
                },
                hospital: true,
            },
        });

        if (!achievement) {
            throw new NotFoundException(`Achievement with ID ${id} not found`);
        }

        return achievement;
    }

    async update(id: number, dto: UpdateAchievementDto) {
        const achievement = await this.prisma.achievement.findUnique({
            where: { achievementId: id },
        });

        if (!achievement) {
            throw new NotFoundException(`Achievement with ID ${id} not found`);
        }

        return this.prisma.achievement.update({
            where: { achievementId: id },
            data: {
                title: dto.title,
                description: dto.description,
                dateAchieved: dto.dateAchieved,
                doctorId: dto.doctorId,
                hospitalId: dto.hospitalId,
            },
            include: {
                doctor: true,
                hospital: true,
            },
        });
    }

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
