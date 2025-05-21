import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateAppointment {
    @ApiProperty({ example: 1, description: 'ID bác sĩ' })
    @IsInt()
    doctorId: number;

    @ApiProperty({ example: 1, description: 'ID người dùng' })
    @IsInt()
    userId: number;

    @ApiProperty({ example: 1, description: 'ID bệnh viện' })
    @IsInt()
    hospitalId: number;

    @ApiProperty({ example: '2025-05-21T09:00:00Z', description: 'Thời gian hẹn khám' })
    @IsDateString()
    scheduledTime: string;

    @ApiProperty({ example: 'Ghi chú thêm nếu có', required: false })
    @IsOptional()
    @IsString()
    note?: string;
}
