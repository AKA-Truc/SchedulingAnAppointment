import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAppointment, UpdateAppointment } from './DTO';

enum ReminderOffset {
    BEFORE_30_MINUTES = 30,
    BEFORE_1_HOUR = 60,
    BEFORE_1_DAY = 1440,
}

@Injectable()
export class AppointmentService {
    constructor(
        private prisma: PrismaService,
    ) { }

    async create(data: CreateAppointment) {
        const conflict = await this.prisma.appointment.findFirst({
            where: {
                doctorId: data.doctorId,
                scheduledTime: data.scheduledTime
            },
        });
        if (conflict) {
            throw new BadRequestException('Doctor already has an appointment at this time')
        }

        const appointment = await this.prisma.appointment.create({
            data: {
                doctorId: data.doctorId,
                userId: data.userId,
                hospitalId: data.hospitalId,
                scheduledTime: data.scheduledTime,
                note: data.note,
                status: 'SCHEDULED',
            },
        });

        const reminderAt = new Date(data.scheduledTime);
        reminderAt.setHours(reminderAt.getHours() - 24);
        const reminderAtString = reminderAt.toISOString();

        return appointment;
    }

    async findAll() {
        return this.prisma.appointment.findMany({
            include: {
                doctor: true,
                user: true,
                hospital: true,
                feedback: true,
                followUps: true,
                payments: true,
            },
        });
    }

    async findOne(id: number) {
        const appointment = await this.prisma.appointment.findUnique({
            where: { appointmentId: id },
            include: {
                doctor: true,
                user: true,
                hospital: true,
                feedback: true,
                followUps: true,
                payments: true,
            },
        });

        if (!appointment) {
            throw new NotFoundException(`Appointment ID ${id} không tồn tại`);
        }

        return appointment;
    }

    async update(id: number, dto: UpdateAppointment) {
        await this.findOne(id); // Kiểm tra tồn tại

        return this.prisma.appointment.update({
            where: { appointmentId: id },
            data: dto,
        });
    }

    async remove(id: number) {
        await this.findOne(id); // Kiểm tra tồn tại

        return this.prisma.appointment.delete({
            where: { appointmentId: id },
        });
    }
}
