import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAppointmentReminder, UpdateAppointmentReminder } from './DTO';

@Injectable()
export class AppointmentReminderService {
    constructor(private readonly prisma: PrismaService) { }

    async create(data: CreateAppointmentReminder) {
        return await this.prisma.appointmentReminder.create({
            data: {
                appointment_ID: data.appointment_ID,
                startDate: data.startDate,
                remindAt: data.remindAt,
                sent: data.sent,
            },
        });
    }

    async findAll() {
        return await this.prisma.appointmentReminder.findMany({
            include: {
                appointment: true,
            },
        });
    }

    async findOne(id: number) {
        const reminder = await this.prisma.appointmentReminder.findUnique({
            where: { reminder_ID: id },
            include: { appointment: true },
        });

        if (!reminder) {
            throw new NotFoundException(`Reminder with ID ${id} not found`);
        }

        return reminder;
    }

    async update(id: number, data: UpdateAppointmentReminder) {
        const reminder = await this.prisma.appointmentReminder.findUnique({
            where: { reminder_ID: id },
        });

        if (!reminder) {
            throw new NotFoundException(`Reminder with ID ${id} not found`);
        }

        return await this.prisma.appointmentReminder.update({
            where: { reminder_ID: id },
            data,
        });
    }

    async remove(id: number) {
        const reminder = await this.prisma.appointmentReminder.findUnique({
            where: { reminder_ID: id },
        });

        if (!reminder) {
            throw new NotFoundException(`Reminder with ID ${id} not found`);
        }

        return await this.prisma.appointmentReminder.delete({
            where: { reminder_ID: id },
        });
    }
}
