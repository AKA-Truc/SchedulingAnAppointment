import { ApiProperty } from '@nestjs/swagger';
import { AppointmentStatus } from '@prisma/client';
import { IsInt, IsDateString, IsOptional, IsString, IsEnum } from 'class-validator';


export class CreateAppointment {
    @ApiProperty({ example: 1, description: 'ID bác sĩ' })
    @IsInt()
    doctorId: number;

    @ApiProperty({ example: 1, description: 'ID người dùng' })
    @IsInt()
    userId: number;

    @ApiProperty({ example: 1, description: 'ID dịch vụ' })
    @IsInt()
    serviceId: number;

    @ApiProperty({ example: '2025-05-21T09:00:00Z', description: 'Thời gian hẹn khám' })
    @IsDateString()
    scheduledTime: string;

    @ApiProperty({ example: 'Ghi chú thêm nếu có', required: false })
    @IsOptional()
    @IsString()
    note?: string;

    @ApiProperty({
        example: AppointmentStatus.SCHEDULED,
        enum: AppointmentStatus,
        description: 'Tình trạng đặt lịch',
    })
    @IsEnum(AppointmentStatus)
    status: AppointmentStatus
}
