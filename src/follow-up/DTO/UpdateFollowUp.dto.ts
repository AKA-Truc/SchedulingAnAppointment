import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateFollowUp {
    @ApiProperty({ example: 1, description: 'ID cuộc hẹn', required: false })
    @IsInt()
    @IsOptional()
    appointment_ID?: number;

    @ApiProperty({ example: '2025-06-01T10:00:00Z', description: 'Ngày tái khám', required: false })
    @IsDateString()
    @IsOptional()
    nextDate?: string;

    @ApiProperty({ example: 'Cập nhật lý do', description: 'Lý do tái khám', required: false })
    @IsString()
    @IsOptional()
    reason?: string;
}
