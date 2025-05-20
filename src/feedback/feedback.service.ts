import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFeedback, UpdateFeedback } from './DTO';

@Injectable()
export class FeedbackService {
    constructor(private readonly prisma: PrismaService) { }

    async create(data: CreateFeedback) {
        return await this.prisma.feedback.create({
            data: {
                appointment_ID: data.appointment_ID,
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
            where: { feedback_ID: id },
            include: { appointment: true },
        });

        if (!feedback) {
            throw new NotFoundException(`Feedback with ID ${id} not found`);
        }

        return feedback;
    }

    async update(id: number, data: UpdateFeedback) {
        const feedback = await this.prisma.feedback.findUnique({
            where: { feedback_ID: id },
        });

        if (!feedback) {
            throw new NotFoundException(`Feedback with ID ${id} not found`);
        }

        return await this.prisma.feedback.update({
            where: { feedback_ID: id },
            data,
        });
    }

    async remove(id: number) {
        const feedback = await this.prisma.feedback.findUnique({
            where: { feedback_ID: id },
        });

        if (!feedback) {
            throw new NotFoundException(`Feedback with ID ${id} not found`);
        }

        return await this.prisma.feedback.delete({
            where: { feedback_ID: id },
        });
    }
}
