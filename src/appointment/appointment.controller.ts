import { Controller, Get, Post, Put, Patch, Delete, Param, Body, Query, ParseIntPipe, Req } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AppointmentService } from './service/appointment.service';
import { FeedbackService } from './service/feedBack.service';
import { CreateAppointment, UpdateAppointment, UpdateAppointmentStatusDto } from './DTO';
import { CreateFeedback, UpdateFeedback } from './DTO';
import { CreateFollowUp, UpdateFollowUp } from './DTO';
import { CreateNotification, UpdateNotification } from './DTO';
import { CreateBroadcastNotification } from './DTO/CreateBroadcastNotification.dto';
import { FollowUpService } from './service/followUp.service';
import { NotificationService } from './service/notification.service';
import { NotificationGateway } from './service/notification.gateway';

@Controller('appointment')
export class AppointmentController {
    notificationsService: any;
    constructor(
        private readonly appointment: AppointmentService,
        private readonly feedback: FeedbackService,
        private readonly followUp: FollowUpService,
        private readonly notification: NotificationService,
        private readonly notificationGateway: NotificationGateway,
    ) { }

    //apointment controller
    @ApiOperation({ summary: 'Create a new appointment' })
    @Post()
    async createAppointment(@Body() data: CreateAppointment) {
        return this.appointment.create(data);
    }

    @Get('counts')
    @ApiOperation({ summary: 'Lấy số lượng cuộc hẹn theo từng trạng thái' })
    @ApiQuery({ name: 'userId', required: true, description: 'ID của người dùng' })
    async getCounts(@Query('userId') userId: number) {
        return this.appointment.getAppointmentCounts(userId);
    }

    @ApiOperation({ summary: 'Get all appointments with pagination' })
    @Get()
    @ApiQuery({ name: 'page', required: false, description: 'Số trang', example: 1 })
    @ApiQuery({ name: 'limit', required: false, description: 'Số lượng trên một trang', example: 10 })
    @ApiQuery({ name: 'userId', required: false, description: 'ID của người dùng', example: '1' })
    @ApiQuery({ name: 'status', required: false, description: 'Trạng thái cuộc hẹn', example: 'SCHEDULED' })
    async getAllAppointmentFilter(
        @Query('userId') userId?: string,
        @Query('status') status?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        const pageNumber = page ? parseInt(page, 10) : 1;
        const limitNumber = limit ? parseInt(limit, 10) : 10;

        const filters = { userId, status };

        return this.appointment.getAllAppointmentFilter(pageNumber, limitNumber, filters);
    }

    @ApiOperation({ summary: 'Get appointment statistics' })
    @Get('statistics')
    async getAppointmentStatistics() {
        return this.appointment.getDashboardStats();
    }

    @ApiOperation({ summary: 'Get appointment by ID' })
    @Get(':id')
    async getAppointmentById(
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.appointment.getAppointmentById(id);
    }

    @ApiOperation({ summary: 'Update appointment' })
    @Put(':id')
    async updateAppointment(
        @Param('id', ParseIntPipe) id: number,
        @Body() data: UpdateAppointment
    ) {
        return this.appointment.updateAppointment(id, data);
    }

    @ApiOperation({ summary: 'Update appointment status' })
    @Patch(':id/status')
    async updateAppointmentStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateAppointmentStatusDto
    ) {
    const { status } = body;

    return this.appointment.updateStatus(id, status);
    }

    @ApiOperation({ summary: 'Cancel appointment' })
    @Delete(':id')
    async deleteAppointment(
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.appointment.cancelAppointment(id);
    }

    @ApiOperation({ summary: 'Get appointments today by doctor ID' })
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'limit', required: false, example: 10 })
    @Get('doctor/:doctorId')
    async getAppointmentsByDoctorId(
        @Param('doctorId', ParseIntPipe) doctorId: number,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        const pageNumber = page ? parseInt(page) : 1;
        const limitNumber = limit ? parseInt(limit) : 10;
        return this.appointment.getTodaysAppointmentsByDoctor(doctorId, pageNumber, limitNumber);
    }

    @ApiOperation({ summary: 'Get appointments by patient ID' })
    @Get('patient/:patientId')
    async getAppointmentsByPatientId(
        @Param('patientId', ParseIntPipe) patientId: number,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        const pageNumber = page ? parseInt(page) : 1;
        const limitNumber = limit ? parseInt(limit) : 10;
        return this.appointment.getAppointmentsByUserId(patientId, pageNumber, limitNumber);
    }

    @ApiOperation({ summary: 'Get doctor with most appointments' })
    @Get('statistics/doctor-most-appointments')
    async getDoctorWithMostAppointments() {
        return this.appointment.getTopDoctorsByAppointments();
    }

    //Feedback controller

    @ApiOperation({ summary: 'Create feedback for an appointment' })
    @Post('feedback')
    async createFeedback(@Body() data: CreateFeedback) {
        return this.feedback.createFeedBack(data);
    }

    @ApiOperation({ summary: 'Get all feedbacks with pagination' })
    @Get('feedback/get-all')
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
    @Get('notification/get-all')
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

    @ApiOperation({ summary: 'Get notifications by user ID' })
    @Get('notification/user/:userId')
    async getNotificationsByUserId(
        @Param('userId', ParseIntPipe) userId: number
    ) {
        return this.notification.findByUser(userId);
    }

    @ApiOperation({ summary: 'Update notification by ID' })
    @Put('notification/:id')
    async updateNotification(
        @Param('id', ParseIntPipe) id: number,
        @Body() data: UpdateNotification
    ) {
        return this.notification.updateNotification(id, data);
    }
    // 1. GET /notifications/unread-count/:userId
    @Get('notifications/unread-count/:userId')
    getUnreadCount(@Param('userId') userId: number) {
        return this.notification.getUnreadCount(userId);
    }

    // 2. PATCH /notifications/:id/read/:userId
    @Patch('notifications/:id/read/:userId')
    markAsRead(@Param('id') id: string, @Param('userId') userId: string) {
        return this.notification.markAsRead(Number(userId), Number(id));
    }

    // 3. POST /notifications/read-all/:userId
    @Post('notifications/read-all/:userId')
    markAllAsRead(@Param('userId') userId: string) {
        return this.notification.markAllAsRead(Number(userId));
    }

    @ApiOperation({ summary: 'Delete notification by ID' })
    @Delete('notification/:id')
    async deleteNotification(
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.notification.deleteNotification(id);
    }

    @ApiOperation({ summary: 'Broadcast notification to all users' })
    @Post('notification/broadcast')
    async broadcastNotification(@Body() data: CreateBroadcastNotification) {
        try {
            // Create notifications for all users
            const result = await this.notification.createBroadcastNotification({
                title: data.title,
                content: data.content,
                type: data.type
            });

            // Broadcast to all connected users via WebSocket
            const broadcastData = {
                type: data.type,
                title: data.title,
                content: data.content,
                createdAt: new Date().toISOString(),
                isBroadcast: true
            };

            this.notificationGateway.broadcastToAll(broadcastData);

            return {
                success: true,
                message: 'Notification broadcasted successfully',
                data: result
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to broadcast notification',
                error: error.message
            };
        }
    }
}
