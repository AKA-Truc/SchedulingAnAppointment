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
                Appointment_ID: dto.Appointment_ID,
                Price: dto.Price,
                Payment_Method: dto.Payment_Method,
                Payment_Status: dto.Payment_Status,
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
                include: { Appointment: true },
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
            where: { Payment_ID: id },
            include: { Appointment: true },
        });

        if (!payment) {
            throw new NotFoundException(`Không tìm thấy thanh toán với ID ${id}`);
        }
        return payment;
    }

    async update(id: number, dto: UpdatePayment) {
        const payment = await this.prisma.payment.findUnique({
            where: { Payment_ID: id },
        });

        if (!payment) {
            throw new NotFoundException(`Không tìm thấy thanh toán với ID ${id}`);
        }

        return this.prisma.payment.update({
            where: { Payment_ID: id },
            data: dto,
        });
    }

    async remove(id: number) {
        const payment = await this.prisma.payment.findUnique({
            where: { Payment_ID: id },
        });

        if (!payment) {
            throw new NotFoundException(`Không tìm thấy thanh toán với ID ${id}`);
        }

        return this.prisma.payment.delete({
            where: { Payment_ID: id },
        });
    }

    // Thống kê theo tháng
    async getMonthlyStatistics(year: number, month: number) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const payments = await this.prisma.payment.findMany({
            where: {
                CreatedAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                Appointment: {
                    include: {
                        Doctor: {
                            include: {
                                User: true,
                            },
                        },
                        Hospital: true,
                    },
                },
            },
        });

        const totalAmount = payments.reduce((sum, payment) => sum + payment.Price, 0);
        const paymentCount = payments.length;

        // Thống kê theo phương thức thanh toán
        const paymentMethodStats = payments.reduce((acc, payment) => {
            acc[payment.Payment_Method] = (acc[payment.Payment_Method] || 0) + 1;
            return acc;
        }, {});

        // Thống kê theo trạng thái thanh toán
        const paymentStatusStats = payments.reduce((acc, payment) => {
            acc[payment.Payment_Status] = (acc[payment.Payment_Status] || 0) + 1;
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
                CreatedAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                Appointment: {
                    include: {
                        Doctor: {
                            include: {
                                User: true,
                            },
                        },
                        Hospital: true,
                    },
                },
            },
        });

        const totalAmount = payments.reduce((sum, payment) => sum + payment.Price, 0);
        const paymentCount = payments.length;

        // Thống kê theo tháng trong quý
        const monthlyStats = payments.reduce((acc, payment) => {
            const month = payment.CreatedAt.getMonth() + 1;
            acc[month] = {
                count: (acc[month]?.count || 0) + 1,
                amount: (acc[month]?.amount || 0) + payment.Price,
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
                CreatedAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                Appointment: {
                    include: {
                        Doctor: {
                            include: {
                                User: true,
                            },
                        },
                        Hospital: true,
                    },
                },
            },
        });

        const totalAmount = payments.reduce((sum, payment) => sum + payment.Price, 0);
        const paymentCount = payments.length;

        // Thống kê theo quý
        const quarterlyStats = payments.reduce((acc, payment) => {
            const month = payment.CreatedAt.getMonth();
            const quarter = Math.floor(month / 3) + 1;
            acc[quarter] = {
                count: (acc[quarter]?.count || 0) + 1,
                amount: (acc[quarter]?.amount || 0) + payment.Price,
            };
            return acc;
        }, {});

        // Thống kê theo tháng
        const monthlyStats = payments.reduce((acc, payment) => {
            const month = payment.CreatedAt.getMonth() + 1;
            acc[month] = {
                count: (acc[month]?.count || 0) + 1,
                amount: (acc[month]?.amount || 0) + payment.Price,
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
                CreatedAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                Appointment: {
                    include: {
                        Doctor: {
                            include: {
                                User: true,
                            },
                        },
                        Hospital: true,
                    },
                },
            },
            orderBy: {
                CreatedAt: 'asc',
            },
        });

        const totalAmount = payments.reduce((sum, payment) => sum + payment.Price, 0);
        const paymentCount = payments.length;

        // Thống kê theo ngày
        const dailyStats = payments.reduce((acc, payment) => {
            const date = payment.CreatedAt.toISOString().split('T')[0];
            acc[date] = {
                count: (acc[date]?.count || 0) + 1,
                amount: (acc[date]?.amount || 0) + payment.Price,
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
