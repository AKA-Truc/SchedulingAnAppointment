import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePayment } from './DTO/CreatePayment.dto';
import { UpdatePayment } from './DTO/UpdatePayment.dto';

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

    // Thống kê theo tháng
    async getMonthlyStatistics(year: number, month: number) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const payments = await this.prisma.payment.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                appointment: {
                    include: {
                        doctor: {
                            include: {
                                user: true,
                            },
                        },
                        hospital: true,
                    },
                },
            },
        });

        const totalAmount = payments.reduce((sum, payment) => sum + payment.price, 0);
        const paymentCount = payments.length;

        // Thống kê theo phương thức thanh toán
        const paymentMethodStats = payments.reduce((acc, payment) => {
            acc[payment.paymentMethod] = (acc[payment.paymentMethod] || 0) + 1;
            return acc;
        }, {});

        // Thống kê theo trạng thái thanh toán
        const paymentStatusStats = payments.reduce((acc, payment) => {
            acc[payment.paymentStatus] = (acc[payment.paymentStatus] || 0) + 1;
            return acc;
        }, {});

        return {
            period: `${month}/${year}`,
            totalAmount,
            paymentCount,
            paymentMethodStats,
            paymentStatusStats,
            payments,
        };
    }

    // Thống kê theo quý
    async getQuarterlyStatistics(year: number, quarter: number) {
        const startMonth = (quarter - 1) * 3 + 1;
        const startDate = new Date(year, startMonth - 1, 1);
        const endDate = new Date(year, startMonth + 2, 0);

        const payments = await this.prisma.payment.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                appointment: {
                    include: {
                        doctor: {
                            include: {
                                user: true,
                            },
                        },
                        hospital: true,
                    },
                },
            },
        });

        const totalAmount = payments.reduce((sum, payment) => sum + payment.price, 0);
        const paymentCount = payments.length;

        // Thống kê theo tháng trong quý
        const monthlyStats = payments.reduce((acc, payment) => {
            const month = payment.createdAt.getMonth() + 1;
            acc[month] = {
                count: (acc[month]?.count || 0) + 1,
                amount: (acc[month]?.amount || 0) + payment.price,
            };
            return acc;
        }, {});

        return {
            period: `Q${quarter}/${year}`,
            totalAmount,
            paymentCount,
            monthlyStats,
            payments,
        };
    }

    // Thống kê theo năm
    async getYearlyStatistics(year: number) {
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31);

        const payments = await this.prisma.payment.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                appointment: {
                    include: {
                        doctor: {
                            include: {
                                user: true,
                            },
                        },
                        hospital: true,
                    },
                },
            },
        });

        const totalAmount = payments.reduce((sum, payment) => sum + payment.price, 0);
        const paymentCount = payments.length;

        // Thống kê theo quý
        const quarterlyStats = payments.reduce((acc, payment) => {
            const month = payment.createdAt.getMonth();
            const quarter = Math.floor(month / 3) + 1;
            acc[quarter] = {
                count: (acc[quarter]?.count || 0) + 1,
                amount: (acc[quarter]?.amount || 0) + payment.price,
            };
            return acc;
        }, {});

        // Thống kê theo tháng
        const monthlyStats = payments.reduce((acc, payment) => {
            const month = payment.createdAt.getMonth() + 1;
            acc[month] = {
                count: (acc[month]?.count || 0) + 1,
                amount: (acc[month]?.amount || 0) + payment.price,
            };
            return acc;
        }, {});

        return {
            year,
            totalAmount,
            paymentCount,
            quarterlyStats,
            monthlyStats,
            payments,
        };
    }

    // Thống kê tổng hợp theo khoảng thời gian tùy chỉnh
    async getCustomPeriodStatistics(startDate: Date, endDate: Date) {
        const payments = await this.prisma.payment.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                appointment: {
                    include: {
                        doctor: {
                            include: {
                                user: true,
                            },
                        },
                        hospital: true,
                    },
                },
            },
        });

        const totalAmount = payments.reduce((sum, payment) => sum + payment.price, 0);
        const paymentCount = payments.length;

        // Thống kê theo ngày
        const dailyStats = payments.reduce((acc, payment) => {
            const date = payment.createdAt.toISOString().split('T')[0];
            acc[date] = {
                count: (acc[date]?.count || 0) + 1,
                amount: (acc[date]?.amount || 0) + payment.price,
            };
            return acc;
        }, {});

        return {
            period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
            totalAmount,
            paymentCount,
            dailyStats,
            payments,
        };
    }
}
