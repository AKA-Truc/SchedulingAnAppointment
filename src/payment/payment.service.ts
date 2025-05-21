import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePayment, UpdatePayment } from './DTO';

@Injectable()
export class PaymentService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreatePayment) {
        const payment = await this.prisma.payment.create({
            data: {
                appointmentId: dto.appointmentId,
                price: dto.price,
                paymentMethod: dto.paymentMethod,
                paymentStatus: dto.paymentStatus,
            },
        });
        return {
            message: 'Thanh toán đã được tạo thành công',
            payment,
        };
    }

    async findAll(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [payments, total] = await Promise.all([
            this.prisma.payment.findMany({
                skip,
                take: limit,
                include: { appointment: true },
            }),
            this.prisma.payment.count(),
        ]);

        return {
            data: payments,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: number) {
        const payment = await this.prisma.payment.findUnique({
            where: { paymentId: id },
            include: { appointment: true },
        });

        if (!payment) {
            throw new NotFoundException(`Không tìm thấy thanh toán với ID ${id}`);
        }
        return payment;
    }

    async update(id: number, dto: UpdatePayment) {
        const payment = await this.prisma.payment.findUnique({
            where: { paymentId: id },
        });

        if (!payment) {
            throw new NotFoundException(`Không tìm thấy thanh toán với ID ${id}`);
        }

        return this.prisma.payment.update({
            where: { paymentId: id },
            data: dto,
        });
    }

    async remove(id: number) {
        const payment = await this.prisma.payment.findUnique({
            where: { paymentId: id },
        });

        if (!payment) {
            throw new NotFoundException(`Không tìm thấy thanh toán với ID ${id}`);
        }

        return this.prisma.payment.delete({
            where: { paymentId: id },
        });
    }
}
