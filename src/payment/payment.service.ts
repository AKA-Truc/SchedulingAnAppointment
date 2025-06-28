import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePayment } from './DTO/CreatePayment.dto';
import { UpdatePayment } from './DTO/UpdatePayment.dto';
import * as crypto from 'crypto';
import * as moment from 'moment';
import { PaymentMethodEnum, PaymentStatusEnum } from '@prisma/client';
const querystring = require('qs'); // Add querystring for VNPay compatibility

@Injectable()
export class PaymentService {
    private readonly logger = new Logger(PaymentService.name);

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

    // VNPay sortObject function - EXACTLY like official VNPay code
    private sortObject(obj: Record<string, any>): Record<string, any> {
        console.log('🔧 [VNPay Service] sortObject input:', obj);
        let sorted: Record<string, any> = {};
        let str: string[] = [];
        let key: string;
        for (key in obj){
            if (obj.hasOwnProperty(key)) {
                str.push(encodeURIComponent(key));
            }
        }
        str.sort();
        for (let i = 0; i < str.length; i++) {
            const sortedKey = str[i];
            sorted[sortedKey] = encodeURIComponent(obj[decodeURIComponent(sortedKey)]).replace(/%20/g, "+");
        }
        console.log('🔧 [VNPay Service] sortObject output:', sorted);
        return sorted;
    }

    async createVnpayPayment(amount: number, orderId: string, orderInfo: string, ipAddr: string) {
        console.log('🚀 [VNPay Service] Starting payment creation...');
        console.log('🚀 [VNPay Service] Input params:', { amount, orderId, orderInfo, ipAddr });
        
        const vnp_TmnCode = process.env.VNPAY_TMN_CODE;
        const vnp_HashSecret = process.env.VNPAY_HASH_SECRET;
        const vnp_Url = process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
        const vnp_ReturnUrl = process.env.VNPAY_RETURN_URL;

        console.log('🔐 [VNPay Service] Environment check:');
        console.log('🔐 TMN_CODE:', vnp_TmnCode ? '✅ Set' : '❌ Missing');
        console.log('🔐 HASH_SECRET:', vnp_HashSecret ? '✅ Set' : '❌ Missing');
        console.log('🔐 URL:', vnp_Url);
        console.log('🔐 RETURN_URL:', vnp_ReturnUrl ? '✅ Set' : '❌ Missing');

        if (!vnp_TmnCode) throw new Error('VNPAY_TMN_CODE is not set');
        if (!vnp_HashSecret) throw new Error('VNPAY_HASH_SECRET is not set');
        if (!vnp_ReturnUrl) throw new Error('VNPAY_RETURN_URL is not set');

        const createDate = moment().format('YYYYMMDDHHmmss');

        // Create vnp_Params object - EXACTLY like VNPay official
        let vnp_Params: any = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = vnp_TmnCode;
        vnp_Params['vnp_Locale'] = 'vn';
        vnp_Params['vnp_CurrCode'] = 'VND';
        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId; // Exactly like VNPay official
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = amount * 100; // VNPay requires amount in VND cents
        vnp_Params['vnp_ReturnUrl'] = vnp_ReturnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;

        console.log('📋 [VNPay Service] Initial vnp_Params (before sort):', vnp_Params);

        // Sort parameters using VNPay official sortObject
        vnp_Params = this.sortObject(vnp_Params);
        console.log('📋 [VNPay Service] Sorted vnp_Params:', vnp_Params);

        // Create signData using querystring.stringify - EXACTLY like VNPay official
        let signData = querystring.stringify(vnp_Params, { encode: false });
        console.log('🔑 [VNPay Service] signData (querystring method):', signData);

        // Generate signature using Buffer - EXACTLY like VNPay official  
        let hmac = crypto.createHmac("sha512", vnp_HashSecret);
        let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
        vnp_Params['vnp_SecureHash'] = signed;

        console.log('🔏 [VNPay Service] Generated signature:', signed);

        // Create final URL - EXACTLY like VNPay official
        let vnpUrl = vnp_Url + '?' + querystring.stringify(vnp_Params, { encode: false });

        console.log('🌐 [VNPay Service] Final payment URL:', vnpUrl);
        console.log('✅ [VNPay Service] Payment creation successful (VNPay Official Method)');

        return {
            paymentUrl: vnpUrl,
            orderId,
            amount,
            signature: signed
        };
    }

    verifyVnpaySignature(vnp_Params: any): boolean {
        console.log('🔍 [VNPay Service] Starting signature verification...');
        console.log('🔍 [VNPay Service] Input params:', vnp_Params);
        
        const vnp_HashSecret = process.env.VNPAY_HASH_SECRET;
        if (!vnp_HashSecret) throw new Error('VNPAY_HASH_SECRET is not set');

        let secureHash = vnp_Params['vnp_SecureHash'];
        
        // Remove signature fields - EXACTLY like VNPay official
        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        console.log('🔍 [VNPay Service] Params after removing hash:', vnp_Params);

        // Sort parameters using VNPay official method
        vnp_Params = this.sortObject(vnp_Params);
        console.log('🔍 [VNPay Service] Sorted params for verification:', vnp_Params);

        // Create signData using querystring - EXACTLY like VNPay official
        let signData = querystring.stringify(vnp_Params, { encode: false });
        console.log('🔍 [VNPay Service] Verification signData:', signData);

        // Generate signature using Buffer - EXACTLY like VNPay official
        let hmac = crypto.createHmac("sha512", vnp_HashSecret);
        let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        console.log('🔍 [VNPay Service] Generated signature for verification:', signed);
        console.log('🔍 [VNPay Service] Received signature:', secureHash);
        console.log('🔍 [VNPay Service] Signatures match:', secureHash === signed);

        return secureHash === signed;
    }

    async findAllForAdmin(options: {
        page: number;
        limit: number;
        status?: any;
        method?: any;
    }) {
        const { page, limit, status, method } = options;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (status) where.paymentStatus = status;
        if (method) where.paymentMethod = method;

        const [payments, total] = await Promise.all([
            this.prisma.payment.findMany({
                where,
                skip,
                take: limit,
                include: {
                    appointment: {
                        include: {
                            user: {
                                select: {
                                    fullName: true,
                                    email: true,
                                    phone: true,
                                },
                            },
                            doctor: {
                                include: {
                                    user: {
                                        select: {
                                            fullName: true,
                                        },
                                    },
                                },
                            },
                            service: {
                                select: {
                                    name: true,
                                    price: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            this.prisma.payment.count({ where }),
        ]);

        return {
            payments,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findByIdForAdmin(id: number) {
        const payment = await this.prisma.payment.findUnique({
            where: { paymentId: id },
            include: {
                appointment: {
                    include: {
                        user: {
                            select: {
                                fullName: true,
                                email: true,
                                phone: true,
                                address: true,
                            },
                        },
                        doctor: {
                            include: {
                                user: {
                                    select: {
                                        fullName: true,
                                    },
                                },
                                specialty: {
                                    select: {
                                        name: true,
                                    },
                                },
                                hospital: {
                                    select: {
                                        name: true,
                                        address: true,
                                    },
                                },
                            },
                        },
                        service: {
                            select: {
                                name: true,
                                price: true,
                                description: true,
                            },
                        },
                    },
                },
            },
        });

        if (!payment) {
            throw new NotFoundException('Payment not found');
        }

        return payment;
    }

    async updateStatus(id: number, paymentStatus: any) {
        const payment = await this.prisma.payment.findUnique({
            where: { paymentId: id },
        });

        if (!payment) {
            throw new NotFoundException('Payment not found');
        }

        const updatedPayment = await this.prisma.payment.update({
            where: { paymentId: id },
            data: { paymentStatus },
            include: {
                appointment: {
                    include: {
                        user: {
                            select: {
                                fullName: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });

        return updatedPayment;
    }
}
