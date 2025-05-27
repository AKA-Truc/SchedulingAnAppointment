import { Controller, Get, Post, Put, Patch, Delete, Param, Body, Query, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AppointmentService } from './service/appointment.service';
import { FeedbackService } from './service/feedBack.service';
import { CreateAppointment, UpdateAppointment } from './DTO';
import { CreateFeedback, UpdateFeedback } from './DTO';
import { CreateFollowUp, UpdateFollowUp } from './DTO';
import { CreateNotification, UpdateNotification } from './DTO';
import { FollowUpService } from './service/followUp.service';
import { NotificationService } from './service/notification.service';
import { AppointmentStatus } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

@Controller('appointment')
export class AppointmentController {
    constructor(
        private readonly appointment: AppointmentService,
        private readonly feedback: FeedbackService,
        private readonly followUp: FollowUpService,
        private readonly notification: NotificationService,
    ) { }

    //apointment controller
    @ApiOperation({ summary: 'Create a new appointment' })
    @Post('appointment')
    async createAppointment(@Body() data: CreateAppointment) {
        return this.appointment.create(data);
    }

    @ApiOperation({ summary: 'Get all appointments with pagination' })
    @Get('appointment')
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'limit', required: false, example: 10 })
    async getAllAppointments(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        // parseInt với fallback
        const pageNumber = page ? parseInt(page) : 1;
        const limitNumber = limit ? parseInt(limit) : 10;
        return this.appointment.getAllAppointments(pageNumber, limitNumber);
    }

    @ApiOperation({ summary: 'Get appointment by ID' })
    @Get('appointment/:id')
    async getAppointmentById(
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.appointment.getAppointmentById(id);
    }

    @ApiOperation({ summary: 'Update appointment' })
    @Put('appointment/:id')
    async updateAppointment(
        @Param('id', ParseIntPipe) id: number,
        @Body() data: UpdateAppointment
    ) {
        return this.appointment.updateAppointment(id, data);
    }

    @ApiOperation({ summary: 'Update appointment status' })
    @Patch('appointment/:id/status')
    async updateAppointmentStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
    ) {
        const validStatuses = Object.values(AppointmentStatus);

        if (!validStatuses.includes(status as AppointmentStatus)) {
            throw new BadRequestException(
            `Trạng thái '${status}' không hợp lệ. Hợp lệ: ${validStatuses.join(', ')}`
            );
        }

        return this.appointment.updateStatus(id, status as AppointmentStatus);
    }

    @ApiOperation({ summary: 'Cancel appointment' })
    @Delete('appointment/:id')
    async deleteAppointment(
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.appointment.cancelAppointment(id);
    }

    //Feedback controller

    @ApiOperation({ summary: 'Create feedback for an appointment' })
    @Post('feedback')
    async createFeedback(@Body() data: CreateFeedback) {
        return this.feedback.createFeedBack(data);
    }

    @ApiOperation({ summary: 'Get all feedbacks with pagination' })
    @Get('feedback')
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'limit', required: false, example: 10 })
    async getAllFeedbacks(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        const pageNumber = page ? parseInt(page) : 1;
        const limitNumber = limit ? parseInt(limit) : 10;
        return this.feedback.getAllFeedBack(pageNumber, limitNumber);
    }

    @ApiOperation({ summary: 'Get feedback by ID' })
    @Get('feedback/:id')
    async getFeedbackById(
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.feedback.getFeedBackById(id);
    }

    @ApiOperation({ summary: 'Update feedback by ID' })
    @Put('feedback/:id')
    async updateFeedback(
        @Param('id', ParseIntPipe) id: number,
        @Body() data: UpdateFeedback
    ) {
        return this.feedback.updateFeedBack(id, data);
    }

    @ApiOperation({ summary: 'Delete feedback by ID' })
    @Delete('feedback/:id')
    async deleteFeedback(
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.feedback.deleteFeedBack(id);
    }

    // FollowUp controller
    @ApiOperation({ summary: 'Create a new follow-up' })
    @Post('follow-up')
    async createFollowUp(@Body() data: CreateFollowUp) {
        return this.followUp.createFollowUp(data);
    }

    @ApiOperation({ summary: 'Get all follow-ups with pagination' })
    @Get('follow-up')
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'limit', required: false, example: 10 })
    async getAllFollowUps(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        const pageNumber = page ? parseInt(page) : 1;
        const limitNumber = limit ? parseInt(limit) : 10;
        return this.followUp.getAllFollowUps(pageNumber, limitNumber);
    }

    @ApiOperation({ summary: 'Get follow-up by ID' })
    @Get('follow-up/:id')
    async getFollowUpById(
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.followUp.getFollowUpById(id);
    }


    @ApiOperation({ summary: 'Get follow-ups by appointment ID' })
    @Get('follow-up/appointment/:appointmentId')
    async getFollowUpsByAppointmentId(
        @Param('appointmentId', ParseIntPipe) appointmentId: number
    ) {
        return this.followUp.getFollowUpsByAppointmentId(appointmentId);
    }

    // @Put('follow-up/:id')
    // async updateFollowUp(
    //     @Param('id', ParseIntPipe) id: number,
    //     @Body() data: UpdateFollowUp
    // ) {
    //     return this.followUpService.updateFollowUp(id, data);
    // }

    @ApiOperation({ summary: 'Delete follow-up by ID' })
    @Delete('follow-up/:id')
    async deleteFollowUp(
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.followUp.deleteFollowUp(id);
    }

    // Notification controller
    @ApiOperation({ summary: 'Create a new notification' })
    @Post('notification')
    async createNotification(@Body() data: CreateNotification) {
        return this.notification.createNotification(data);
    }

    @ApiOperation({ summary: 'Get all notifications with pagination' })
    @Get('notification')
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'limit', required: false, example: 10 })
    async getAllNotifications(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        const pageNumber = page ? parseInt(page) : 1;
        const limitNumber = limit ? parseInt(limit) : 10;
        return this.notification.getAllNotifications(pageNumber, limitNumber);
    }

    @ApiOperation({ summary: 'Get notification by ID' })
    @Get('notification/:id')
    async getNotificationById(
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.notification.getNotification(id);
    }

    @ApiOperation({ summary: 'Update notification by ID' })
    @Put('notification/:id')
    async updateNotification(
        @Param('id', ParseIntPipe) id: number,
        @Body() data: UpdateNotification
    ) {
        return this.notification.updateNotification(id, data);
    }

    @ApiOperation({ summary: 'Delete notification by ID' })
    @Delete('notification/:id')
    async deleteNotification(
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.notification.deleteNotification(id);
    }
}
