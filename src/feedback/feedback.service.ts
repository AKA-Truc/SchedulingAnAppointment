import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFeedback, UpdateFeedback } from './DTO';

@Injectable()
export class FeedbackService {
    constructor(private readonly prisma: PrismaService) { }

    async create(data: CreateFeedback) {
        return await this.prisma.feedback.create({
            data: {
                appointmentId: data.appointmentId,
                rating: data.rating,
                comment: data.comment,
            },
        });
    }

    async findAll() {
        return await this.prisma.feedback.findMany({
            include: {
                appointment: true,
            },
        });
    }

    async findOne(id: number) {
        const feedback = await this.prisma.feedback.findUnique({
            where: { feedbackId: id },
            include: { appointment: true },
        });

        if (!feedback) {
            throw new NotFoundException(`Feedback with ID ${id} not found`);
        }

        return feedback;
    }

    async update(id: number, data: UpdateFeedback) {
        const feedback = await this.prisma.feedback.findUnique({
            where: { feedbackId: id },
        });

        if (!feedback) {
            throw new NotFoundException(`Feedback with ID ${id} not found`);
        }

        return await this.prisma.feedback.update({
            where: { feedbackId: id },
            data,
        });
    }

    async remove(id: number) {
        const feedback = await this.prisma.feedback.findUnique({
            where: { feedbackId: id },
        });

        if (!feedback) {
            throw new NotFoundException(`Feedback with ID ${id} not found`);
        }

        return await this.prisma.feedback.delete({
            where: { feedbackId: id },
        });
    }
}
