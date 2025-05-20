import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateDoctorLeave {
    @ApiProperty({ example: 1, description: 'ID bác sĩ', required: false })
    @IsInt()
    @IsOptional()
    doctor_ID?: number;

    @ApiProperty({ example: '2025-05-20T08:00:00Z', description: 'Ngày bắt đầu nghỉ', required: false })
    @IsDateString()
    @IsOptional()
    startDate?: string;

    @ApiProperty({ example: '2025-05-22T18:00:00Z', description: 'Ngày kết thúc nghỉ', required: false })
    @IsDateString()
    @IsOptional()
    endDate?: string;

    @ApiProperty({ example: 'Nghỉ phép', description: 'Lý do nghỉ', required: false })
    @IsString()
    @IsOptional()
    reason?: string;
}
