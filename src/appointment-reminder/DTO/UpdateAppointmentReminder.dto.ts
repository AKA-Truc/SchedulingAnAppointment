import { IsDateString, IsBoolean, IsInt, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAppointmentReminder {
    @ApiPropertyOptional({ example: 1, description: 'ID của cuộc hẹn' })
    @IsOptional()
    @IsInt()
    appointment_ID?: number;

    @ApiPropertyOptional({ example: '2025-06-01T08:00:00Z', description: 'Ngày bắt đầu nhắc nhở' })
    @IsOptional()
    @IsDateString()
    startDate?: Date;

    @ApiPropertyOptional({ example: '2025-05-31T08:00:00Z', description: 'Thời điểm nhắc' })
    @IsOptional()
    @IsDateString()
    remindAt?: Date;

    @ApiPropertyOptional({ example: true, description: 'Đã gửi nhắc chưa' })
    @IsOptional()
    @IsBoolean()
    sent?: boolean;
}
