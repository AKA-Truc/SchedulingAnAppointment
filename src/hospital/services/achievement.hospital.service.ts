import { Injectable, NotFoundException } from "@nestjs/common";
import { Achievement, Prisma } from "@prisma/client";
import { UpdateAchievement } from "src/doctor/DTO";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class AchievementHospitalService {
    constructor(
        private readonly prismaService: PrismaService
    ) { }

    async search(params: {
        skip?: number, take?: number, where?: Prisma.AchievementWhereInput
    }): Promise<Achievement[]> {
        const { skip, take, where } = params
        return await this.prismaService.achievement.findMany({
            skip,
            take,
            where
        })
    }

    async getAchievementsOfHospital(hospitalId: number, page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const [data, total] = await this.prismaService.$transaction([
            this.prismaService.achievement.findMany({
                where: { hospitalId },
                skip,
                take: limit,
                orderBy: { achievementId: 'desc' },
                include: {
                    doctor: { include: { user: true } },
                },
            }),
            this.prismaService.achievement.count({ where: { hospitalId } }),
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

    async updateAchievementOfHospital(
        hospitalId: number,
        achievementId: number,
        dto: UpdateAchievement,
    ) {
        const achievement = await this.prismaService.achievement.findUnique({
            where: { achievementId },
        });

        if (!achievement) {
            throw new NotFoundException(`Achievement with ID ${achievementId} not found`);
        }

        if (achievement.hospitalId !== hospitalId) {
            throw new NotFoundException(`Hospital does not own this achievement`);
        }

        const updateData: any = {};
        if (dto.title !== undefined) updateData.title = dto.title;
        if (dto.description !== undefined) updateData.description = dto.description;
        if (dto.dateAchieved !== undefined) updateData.dateAchieved = dto.dateAchieved;

        // Không cho phép hospital thay đổi doctorId hoặc hospitalId
        return this.prismaService.achievement.update({
            where: { achievementId },
            data: updateData,
            include: {
                doctor: { include: { user: true } },
                hospital: true,
            },
        });
    }

    async removeAchievementOfHospital(hospitalId: number, achievementId: number) {
        const achievement = await this.prismaService.achievement.findUnique({
            where: { achievementId },
        });

        if (!achievement) {
            throw new NotFoundException(`Achievement with ID ${achievementId} not found`);
        }

        if (achievement.hospitalId !== hospitalId) {
            throw new NotFoundException(`Hospital does not own this achievement`);
        }

        return this.prismaService.achievement.delete({
            where: { achievementId },
            include: {
                doctor: true,
                hospital: true,
            },
        });
    }

    async searchAchievementsOfHospital(hospitalId: number, keyword: string = '', page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const [data, total] = await this.prismaService.$transaction([
            this.prismaService.achievement.findMany({
                where: {
                    hospitalId,
                    OR: [
                        { title: { contains: keyword, mode: 'insensitive' } },
                        { description: { contains: keyword, mode: 'insensitive' } },
                    ],
                },
                skip,
                take: limit,
                orderBy: { dateAchieved: 'desc' },
                include: {
                    doctor: { include: { user: true } },
                    hospital: true,
                },

            }),
            this.prismaService.achievement.count({
                where: {
                    hospitalId,
                    OR: [
                        { title: { contains: keyword, mode: 'insensitive' } },
                        { description: { contains: keyword, mode: 'insensitive' } },
                    ],
                },
            }),
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