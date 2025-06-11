import { Injectable } from "@nestjs/common";
import { AppointmentStatus } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class DashboardHospitalService {
    constructor(
        private readonly prismaService: PrismaService,
    ) { }

    //APPOINTMENT=======================================================================

    // Đếm tổng số cuộc hẹn trong tháng
    async countAppointmentsInMonth(month: number, year: number, hospitalId: number) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        return this.prismaService.appointment.count({
            where: {
                scheduledTime: {
                    gte: startDate,
                    lte: endDate,
                },
                doctor: {
                    hospitalId: hospitalId,
                },
            },
        });
    }

    // Thống kê số lượng theo từng trạng thái
    async countAppointmentByStatus(month: number, year: number, hospitalId: number) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const statuses = Object.values(AppointmentStatus);

        const counts = await Promise.all(
            statuses.map(async (status) => {
                const count = await this.prismaService.appointment.count({
                    where: {
                        scheduledTime: {
                            gte: startDate,
                            lte: endDate,
                        },
                        status,
                        doctor: {
                            hospitalId,
                        },
                    },
                });
                return { status, count };
            })
        );

        return counts;
    }

    //Thống kê số lượng mỗi ngày trong tháng
    async dailyAppointmentsInMonth(month: number, year: number, hospitalId: number) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const appointments = await this.prismaService.appointment.findMany({
            where: {
                scheduledTime: {
                    gte: startDate,
                    lte: endDate,
                },
                doctor: {
                    hospitalId,
                },
            },
            select: {
                scheduledTime: true,
            },
        });

        const counts: { [day: string]: number } = {};

        for (let d = 1; d <= endDate.getDate(); d++) {
            counts[d] = 0;
        }

        for (const appointment of appointments) {
            const day = appointment.scheduledTime.getDate();
            counts[day] += 1;
        }

        return Object.keys(counts).map(day => ({
            day: parseInt(day),
            count: counts[day],
        }));
    }

    //Bác sĩ có nhiều cuộc hẹn nhất
    async topDoctorByAppointment(limit: number, hospitalId: number) {
        const results = await this.prismaService.appointment.groupBy({
            by: ['doctorId'],
            where: {
                doctor: {
                    hospitalId,
                },
            },
            _count: {
                doctorId: true,
            },
            orderBy: {
                _count: {
                    doctorId: 'desc',
                },
            },
            take: limit,
        });

        const enriched = await Promise.all(
            results.map(async (item) => {
                const doctor = await this.prismaService.doctor.findUnique({
                    where: {
                        doctorId: item.doctorId,
                    },
                    include: {
                        user: true,
                    },
                });

                return {
                    doctorId: doctor?.doctorId,
                    fullName: doctor?.user.fullName,
                    totalAppointments: item._count.doctorId,
                };
            }),
        );

        return enriched;
    }


    //REVENUE==================================================================
    //Tổng doanh thu từ các cuộc hẹn thành công trong tháng
    async totalRevenueInMonth(month: number, year: number, hospitalId?: number) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const filters: any = {
            createdAt: {
                gte: startDate,
                lte: endDate,
            },
            paymentStatus: 'PAID',
            appointment: {
                status: 'COMPLETED',
            },
        };

        if (hospitalId) {
            filters.appointment.doctor = {
                hospitalId: hospitalId,
            };
        }

        const result = await this.prismaService.payment.aggregate({
            where: filters,
            _sum: {
                price: true,
            },
        });

        return {
            totalRevenue: result._sum.price || 0,
        };
    }


    //Thống kê doanh thu theo ngày
    async revenueByDayInMonth(month: number, year: number, hospitalId?: number) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const payments = await this.prismaService.payment.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
                paymentStatus: 'PAID',
                appointment: {
                    status: 'COMPLETED',
                    ...(hospitalId && {
                        doctor: {
                            hospitalId,
                        },
                    }),
                },
            },
            select: {
                createdAt: true,
                price: true,
            },
        });

        const revenueByDay: { [day: number]: number } = {};

        // Khởi tạo 0 cho từng ngày
        for (let i = 1; i <= endDate.getDate(); i++) {
            revenueByDay[i] = 0;
        }

        payments.forEach((p) => {
            const day = p.createdAt.getDate();
            revenueByDay[day] += p.price;
        });

        return Object.entries(revenueByDay).map(([day, value]) => ({
            day: Number(day),
            revenue: value,
        }));
    }


    //Doanh thu theo bác sĩ trong tháng
    async revenueByDoctor(month: number, year: number, hospitalId?: number) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const payments = await this.prismaService.payment.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
                paymentStatus: 'PAID',
                appointment: {
                    status: 'COMPLETED',
                    ...(hospitalId && {
                        doctor: {
                            hospitalId,
                        },
                    }),
                },
            },
            select: {
                price: true,
                appointment: {
                    select: {
                        doctorId: true,
                        doctor: {
                            select: {
                                userId: true,
                                user: {
                                    select: {
                                        fullName: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        const revenueMap: {
            [doctorId: number]: { fullName: string; revenue: number };
        } = {};

        payments.forEach((p) => {
            const doctorId = p.appointment.doctorId;
            const fullName = p.appointment.doctor.user.fullName;

            if (!revenueMap[doctorId]) {
                revenueMap[doctorId] = {
                    fullName,
                    revenue: 0,
                };
            }

            revenueMap[doctorId].revenue += p.price;
        });

        return Object.entries(revenueMap).map(([doctorId, info]) => ({
            doctorId: Number(doctorId),
            fullName: info.fullName,
            revenue: info.revenue,
        }));
    }



    //Satisfaction Reports========================================================

    //Điểm hài lòng trung bình trong tháng
    async averageRatingInMonth(month: number, year: number, hospitalId?: number) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const filters: any = {
            createdAt: {
                gte: startDate,
                lte: endDate,
            },
            appointment: {
                status: 'COMPLETED',
            },
        };

        if (hospitalId) {
            filters.appointment.doctor = {
                hospitalId,
            };
        }

        const result = await this.prismaService.feedback.aggregate({
            where: filters,
            _avg: {
                rating: true,
            },
        });

        return {
            averageRating: result._avg.rating || 0,
        };
    }


    // Số lượng feedback trong tháng
    async countFeedbackInMonth(month: number, year: number) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const count = await this.prismaService.feedback.count({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        });

        return { totalFeedback: count };
    }


    //Bác sĩ có điểm đánh giá cao nhất
    async topDoctorsByRating(limit: number = 5) {
        // Lấy tất cả feedbacks kèm doctorId
        const feedbacks = await this.prismaService.feedback.findMany({
            where: {
                appointment: {
                    status: 'COMPLETED',
                },
            },
            select: {
                rating: true,
                appointment: {
                    select: {
                        doctorId: true,
                        doctor: {
                            select: {
                                userId: true,
                                user: {
                                    select: { fullName: true },
                                },
                            },
                        },
                    },
                },
            },
        });

        const ratingMap: Record<number, { fullName: string; total: number; count: number }> = {};

        feedbacks.forEach((fb) => {
            const doctorId = fb.appointment.doctorId;
            const fullName = fb.appointment.doctor.user.fullName;

            if (!ratingMap[doctorId]) {
                ratingMap[doctorId] = { fullName, total: 0, count: 0 };
            }

            ratingMap[doctorId].total += fb.rating;
            ratingMap[doctorId].count += 1;
        });

        const result = Object.entries(ratingMap)
            .map(([doctorId, data]) => ({
                doctorId: Number(doctorId),
                fullName: data.fullName,
                averageRating: data.count ? data.total / data.count : 0,
            }))
            .sort((a, b) => b.averageRating - a.averageRating)
            .slice(0, limit);

        return result;
    }

}