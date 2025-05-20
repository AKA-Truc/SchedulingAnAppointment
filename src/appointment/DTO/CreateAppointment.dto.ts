import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateAppointment {
    @ApiProperty({ example: 1, description: 'ID bác sĩ' })
    @IsInt()
    Doctor_ID: number;

    @ApiProperty({ example: 1, description: 'ID người dùng' })
    @IsInt()
    User_ID: number;

    @ApiProperty({ example: 1, description: 'ID bệnh viện' })
    @IsInt()
    Hospital_ID: number;

    @ApiProperty({ example: '2025-05-21T09:00:00Z', description: 'Thời gian hẹn khám' })
    @IsDateString()
    Scheduled_time: string;

    @ApiProperty({ example: 'Ghi chú thêm nếu có', required: false })
    @IsOptional()
    @IsString()
    Note?: string;
}
