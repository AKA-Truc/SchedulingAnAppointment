import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Processor('reminder-queue')
@Injectable()
export class ReminderProcessor {
  constructor(private readonly prisma: PrismaService) {}

  @Process('send-reminder')
  async handleReminder(job: Job) {
    const { appointmentId, userId } = job.data;

    console.log(`[Reminder] Sending reminder for appointment ${appointmentId} to user ${userId}`);

    // TODO: Gửi email hoặc push ở đây

    // Đánh dấu reminder là đã gửi
    await this.prisma.appointmentReminder.update({
      where: { appointment_ID: appointmentId },
      data: { sent: true },
    });

    return true;
  }
}