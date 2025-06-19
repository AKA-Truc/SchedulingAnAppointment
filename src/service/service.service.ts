import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateServiceDto } from "./dto/CreateService.dto";

@Injectable()
export class ServicesService {
    constructor(private readonly prismaService: PrismaService) { }

    async create(dto: CreateServiceDto) {
        return this.prismaService.service.create({ data: dto });
    }

    async getAll(page: number, limit: number) {
        const total = await this.prismaService.service.count();
        const skip = (page - 1) * limit;
        const services = await this.prismaService.service.findMany({
            skip,
            take: limit,
        });
        return {
            data: services,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findById(id: number) {
        const service = await this.prismaService.service.findUnique({
            where: { serviceId: id }
        })
        if (!service) {
            throw new NotFoundException('Service not found')
        }
        return service;
    }

    async update(id: number, dto: CreateServiceDto) {
        await this.findById(id);
        return this.prismaService.service.update({
            where: { serviceId: id },
            data: dto
        })
    }

    async delete(id: number) {
        await this.findById(id);
        return this.prismaService.service.delete({
            where: { serviceId: id }
        })
    }
}