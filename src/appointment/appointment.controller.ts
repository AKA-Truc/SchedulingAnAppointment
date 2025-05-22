import { Controller, Get, Post, Put, Patch, Delete, Param, Body, Query, ParseIntPipe } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { AppointmentService } from './appointment.service';
import { CreateAppointment, UpdateAppointment } from './DTO';
import { AppointmentStatus } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

@Controller('appointment')
export class AppointmentController {
    constructor(private readonly appointment: AppointmentService) { }

    @Post()
    async createAppointment(@Body() data: CreateAppointment) {
        return this.appointment.create(data);
    }

    @Get()
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

    @Get(':id')
    async getAppointmentById(
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.appointment.getAppointmentById(id);
    }

    @Put(':id')
    async updateAppointment(
        @Param('id', ParseIntPipe) id: number,
        @Body() data: UpdateAppointment
    ) {
        return this.appointment.updateAppointment(id, data);
    }

    @Patch(':id/status')
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

    @Delete(':id')
    async deleteAppointment(
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.appointment.cancelAppointment(id);
    }
}
