import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAppointment, UpdateAppointment } from './DTO';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

enum ReminderOffset {
  BEFORE_30_MINUTES = 30,
  BEFORE_1_HOUR = 60,
  BEFORE_1_DAY = 1440,
}

@Injectable()
export class AppointmentService {
    constructor(
        private prisma: PrismaService,
        @InjectQueue('reminder-queue') private reminderQueue: Queue,
    ) { }

    async create(data: CreateAppointment) {
        const conflict = await this.prisma.appointment.findFirst({
            where: {
                Doctor_ID: data.Doctor_ID,
                Scheduled_time: data.Scheduled_time
            },
        });
        if (conflict) {
            throw new BadRequestException('Doctor already has an appointment at this time')
        }

        const appointment = await this.prisma.appointment.create({
            data: {
                Doctor_ID: data.Doctor_ID,
                User_ID: data.User_ID,
                Hospital_ID: data.Hospital_ID,
                Scheduled_time: data.Scheduled_time,
                Note: data.Note,
                status: 'SCHEDULED',
            },
        });

        const reminderAt = new Date(data.Scheduled_time);
        reminderAt.setHours(reminderAt.getHours() - 24);
        const reminderAtString = reminderAt.toISOString();

        const reminder = await this.prisma.appointmentReminder.create({
            data: {
                appointment_ID: appointment.Appointment_ID,
                startDate: new Date(),
                remindAt: reminderAtString,
                sent: false,
            }
        })

        await this.reminderQueue.add('send-reminder', {
            reminder
        }, {
            delay: reminderAt.getTime() - Date.now(),
            attempts: 3,
            removeOnComplete: true,
        });

        return appointment;
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
