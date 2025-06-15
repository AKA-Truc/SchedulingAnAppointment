import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSpecialty, UpdateSpecialty } from '../DTO';

@Injectable()
export class SpecialtyService {
    constructor(private readonly prisma: PrismaService) { }

    // Kiểm tra Specialty có tồn tại theo ID, nếu không thì ném lỗi.
    private async ensureSpecialtyExists(id: number) {
        const specialty = await this.prisma.specialty.findUnique({
            where: { specialtyId: id },
        });

        if (!specialty) {
            throw new NotFoundException(`Specialty with ID ${id} not found.`);
        }

        return specialty;
    }

    // Kiểm tra tên chuyên khoa đã tồn tại chưa, nếu có thì ném lỗi.
    private async ensureNameUnique(name: string) {
        const exists = await this.prisma.specialty.findFirst({
            where: { name },
        });

        if (exists) {
            throw new BadRequestException(`Specialty with name "${name}" already exists.`);
        }
    }

    // Tạo mới một chuyên khoa.
    async create(dto: CreateSpecialty) {
        await this.ensureNameUnique(dto.name);

        const specialty = await this.prisma.specialty.create({
            data: {
                name: dto.name,
                description: dto.description,
            },
        });

        return {
            message: 'Specialty created successfully.',
            specialty,
        };
    }

    // Lấy danh sách tất cả chuyên khoa, có phân trang.
    async findAll(page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const [specialties, total] = await Promise.all([
            this.prisma.specialty.findMany({
                skip,
                take: limit,
                include: { doctors: true }, // Kèm theo danh sách bác sĩ thuộc chuyên khoa này
            }),
            this.prisma.specialty.count(),
        ]);

        return {
            data: specialties,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    //  Lấy thông tin chi tiết của một chuyên khoa theo ID.
    async findOne(id: number) {
        const specialty = await this.prisma.specialty.findUnique({
            where: { specialtyId: id },
            include: { doctors: true },
        });

        if (!specialty) {
            throw new NotFoundException(`Specialty with ID ${id} not found.`);
        }

        return specialty;
    }

    // Cập nhật thông tin chuyên khoa.
    async update(id: number, dto: UpdateSpecialty) {
        const specialty = await this.ensureSpecialtyExists(id);

        // Nếu tên mới khác tên cũ, kiểm tra xem tên mới có bị trùng không
        if (dto.name && dto.name !== specialty.name) {
            await this.ensureNameUnique(dto.name);
        }

        const updated = await this.prisma.specialty.update({
            where: { specialtyId: id },
            data: {
                name: dto.name,
                description: dto.description,
            },
        });

        return {
            message: 'Specialty updated successfully.',
            specialty: updated,
        };
    }

    // Xóa một chuyên khoa. Không cho phép xóa nếu có bác sĩ liên kết.
    async remove(id: number) {
        await this.ensureSpecialtyExists(id);

        const hasDoctors = await this.prisma.doctor.count({
            where: { specialtyId: id },
        });

        if (hasDoctors > 0) {
            throw new BadRequestException(
                'Cannot delete specialty because it has associated doctors.',
            );
        }

        await this.prisma.specialty.delete({
            where: { specialtyId: id },
        });

        return {
            message: 'Specialty deleted successfully.',
        };
    }
}
