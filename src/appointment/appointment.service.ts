import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAppointment, UpdateAppointment } from './DTO';

@Injectable()
export class AppointmentService {
    constructor(private prisma: PrismaService) { }

    async create(data: CreateAppointment) {
        return this.prisma.appointment.create({
            data,
        });
    }

    async findAll() {
        return this.prisma.appointment.findMany({
            include: {
                Doctor: true,
                User: true,
                Hospital: true,
                reminder: true,
                feedback: true,
                medicalRecord: true,
                followUps: true,
                payments: true,
            },
        });
    }

    async findOne(id: number) {
        const appointment = await this.prisma.appointment.findUnique({
            where: { Appointment_ID: id },
            include: {
                Doctor: true,
                User: true,
                Hospital: true,
                reminder: true,
                feedback: true,
                medicalRecord: true,
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
            where: { Appointment_ID: id },
            data: dto,
        });
    }

    async remove(id: number) {
        await this.findOne(id); // Kiểm tra tồn tại

        return this.prisma.appointment.delete({
            where: { Appointment_ID: id },
        });
    }
}
