import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, IsDateString } from 'class-validator';

export class CreateDoctorLeave {
    @ApiProperty({ example: 1, description: 'ID bác sĩ' })
    @IsInt()
    @IsNotEmpty()
    doctor_ID: number;

    @ApiProperty({ example: '2025-05-20T08:00:00Z', description: 'Ngày bắt đầu nghỉ' })
    @IsDateString()
    startDate: string;

    @ApiProperty({ example: '2025-05-22T18:00:00Z', description: 'Ngày kết thúc nghỉ' })
    @IsDateString()
    endDate: string;

    @ApiProperty({ example: 'Nghỉ phép', description: 'Lý do nghỉ' })
    @IsString()
    @IsNotEmpty()
    reason: string;
}
