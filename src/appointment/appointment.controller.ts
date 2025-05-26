import { Controller, Get, Post, Put, Patch, Delete, Param, Body, Query, ParseIntPipe } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { AppointmentService } from './service/appointment.service';
import { FeedbackService } from './service/feedBack.service';
import { CreateAppointment, UpdateAppointment } from './DTO';
import { CreateFeedback, UpdateFeedback } from './DTO';
import { CreateFollowUp, UpdateFollowUp } from './DTO';
import { FollowUpService } from './service/followUp.service';
import { AppointmentStatus } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

@Controller('appointment')
export class AppointmentController {
    constructor(
        private readonly appointment: AppointmentService,
        private readonly feedback: FeedbackService,
        private readonly followUpService: FollowUpService,
    ) { }

    //apointment controller
    @Post('appointment')
    async createAppointment(@Body() data: CreateAppointment) {
        return this.appointment.create(data);
    }

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

    @Get('appointment/:id')
    async getAppointmentById(
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.appointment.getAppointmentById(id);
    }

    @Put('appointment/:id')
    async updateAppointment(
        @Param('id', ParseIntPipe) id: number,
        @Body() data: UpdateAppointment
    ) {
        return this.appointment.updateAppointment(id, data);
    }

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

    @Delete('appointment/:id')
    async deleteAppointment(
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.appointment.cancelAppointment(id);
    }

    //Feedback controller

    @Post('feedback')
    async createFeedback(@Body() data: CreateFeedback) {
        return this.feedback.createFeedBack(data);
    }

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

    @Get('feedback/:id')
    async getFeedbackById(
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.feedback.getFeedBackById(id);
    }

    @Put('feedback/:id')
    async updateFeedback(
        @Param('id', ParseIntPipe) id: number,
        @Body() data: UpdateFeedback
    ) {
        return this.feedback.updateFeedBack(id, data);
    }

    @Delete('feedback/:id')
    async deleteFeedback(
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.feedback.deleteFeedBack(id);
    }

    // FollowUp controller
    @Post('follow-up')
    async createFollowUp(@Body() data: CreateFollowUp) {
        return this.followUpService.createFollowUp(data);
    }

    @Get('follow-up')
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'limit', required: false, example: 10 })
    async getAllFollowUps(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        const pageNumber = page ? parseInt(page) : 1;
        const limitNumber = limit ? parseInt(limit) : 10;
        return this.followUpService.getAllFollowUps(pageNumber, limitNumber);
    }

    @Get('follow-up/:id')
    async getFollowUpById(
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.followUpService.getFollowUpById(id);
    }


    @Get('follow-up/appointment/:appointmentId')
    async getFollowUpsByAppointmentId(
        @Param('appointmentId', ParseIntPipe) appointmentId: number
    ) {
        return this.followUpService.getFollowUpsByAppointmentId(appointmentId);
    }

    // @Put('follow-up/:id')
    // async updateFollowUp(
    //     @Param('id', ParseIntPipe) id: number,
    //     @Body() data: UpdateFollowUp
    // ) {
    //     return this.followUpService.updateFollowUp(id, data);
    // }

    
    @Delete('follow-up/:id')
    async deleteFollowUp(
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.followUpService.deleteFollowUp(id);
    }


}
