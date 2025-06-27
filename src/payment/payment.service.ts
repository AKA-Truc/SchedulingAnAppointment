import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePayment } from './DTO/CreatePayment.dto';
import { UpdatePayment } from './DTO/UpdatePayment.dto';
import * as crypto from 'crypto';

@Injectable()
export class PaymentService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly httpService: HttpService,
    ) { }

    async create(dto: CreatePayment) {
        // Ép kiểu và kiểm tra appointmentId
        const appointmentId = Number(dto.appointmentId);
        console.log('Received appointmentId:', appointmentId);
        if (isNaN(appointmentId)) {
            throw new BadRequestException('appointmentId is required and must be a valid number');
        }
        const payment = await this.prisma.payment.create({
            data: {
                appointmentId: appointmentId,
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

    async createMomoPayment(amount: number, orderId: string, orderInfo: string) {
        const partnerCode = process.env.MOMO_PARTNER_CODE;
        const accessKey = process.env.MOMO_ACCESS_KEY;
        const secretKey = process.env.MOMO_SECRET_KEY;
        const endpoint = process.env.MOMO_ENDPOINT;
        const redirectUrl = process.env.MOMO_REDIRECT_URL;
        const ipnUrl = process.env.MOMO_IPN_URL;
        const requestId = Date.now().toString();
        const requestType = 'captureWallet';
        const extraData = '';

        if (!secretKey) throw new Error('MOMO_SECRET_KEY is not set');
        if (!partnerCode) throw new Error('MOMO_PARTNER_CODE is not set');
        if (!accessKey) throw new Error('MOMO_ACCESS_KEY is not set');
        if (!endpoint) throw new Error('MOMO_ENDPOINT is not set');
        if (!redirectUrl) throw new Error('MOMO_REDIRECT_URL is not set');
        if (!ipnUrl) throw new Error('MOMO_IPN_URL is not set');

        const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
        const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

        const body = {
            partnerCode,
            accessKey,
            requestId,
            amount: amount.toString(),
            orderId,
            orderInfo,
            redirectUrl,
            ipnUrl,
            requestType,
            signature,
            extraData,
            lang: 'vi',
        };

        console.log('Request body gửi MoMo:', body);
        try {
            const response = await this.httpService.axiosRef.post(endpoint, body, {
                headers: { 'Content-Type': 'application/json' },
            });
            console.log('MoMo response:', response.data); // log chi tiết
            return response.data;
        } catch (error) {
            console.error('MoMo error:', error?.response?.data || error.message || error);
            return { message: error?.response?.data?.message || error.message || 'Lỗi khi gọi MoMo', ...error?.response?.data };
        }
    }
}
