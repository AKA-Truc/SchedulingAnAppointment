import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateFeedback, UpdateFeedback } from "../DTO";

@Injectable()
export class FeedbackService {
    constructor(private prisma: PrismaService) {}

    async createFeedBack(data: CreateFeedback) {
        const appointment = await this.prisma.appointment.findUnique({
            where: { appointmentId: data.appointmentId },
        });

        if (!appointment) {
            throw new NotFoundException("Appointment not found");
        }

        const feedback = await this.prisma.feedback.create({
            data: {
                appointmentId: data.appointmentId,
                rating: data.rating,
                comment: data.comment,
            },
        });

        return feedback;
    }

    async getAllFeedBack(page: number, limit: number) {
        const feedbacks = await this.prisma.feedback.findMany({
            skip: (page - 1) * limit,
            take: limit,
        });

        const totalFeedbacks = await this.prisma.feedback.count();

        return {
            data: feedbacks,
            total: totalFeedbacks,
            page,
            limit,
        };
        
    }

    async getFeedBackById(id: number) {
        const feedback = await this.prisma.feedback.findUnique({
            where: { feedbackId: id },
        });

        if (!feedback) {
            throw new NotFoundException("Feedback not found");
        }

        return feedback;
    }

    async updateFeedBack(id: number, data: UpdateFeedback) {
        const feedback = await this.prisma.feedback.findUnique({
            where: { feedbackId: id },
        });

        if (!feedback) {
            throw new NotFoundException("Feedback not found");
        }

        const updatedFeedback = await this.prisma.feedback.update({
            where: { feedbackId: id },
            data: {
                rating: data.rating,
                comment: data.comment,
            },
        });

        return updatedFeedback;
    }

    async deleteFeedBack(id: number) {
        const feedback = await this.prisma.feedback.findUnique({
            where: { feedbackId: id },
        });

        if (!feedback) {
            throw new NotFoundException("Feedback not found");
        }

        await this.prisma.feedback.delete({
            where: { feedbackId: id },
        });

        return { message: "Feedback deleted successfully" };
    }
}