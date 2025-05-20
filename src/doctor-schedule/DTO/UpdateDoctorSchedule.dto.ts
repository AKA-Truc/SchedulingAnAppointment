import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator';

export class UpdateDoctorSchedule {
    @ApiProperty({ example: 1, description: 'ID bác sĩ', required: false })
    @IsInt()
    @IsOptional()
    doctor_ID?: number;

    @ApiProperty({ example: 2, description: 'Ngày trong tuần (0=Chủ nhật, 1=Thứ 2, ... 6=Thứ 7)', required: false })
    @IsInt()
    @Min(0)
    @Max(6)
    @IsOptional()
    dayOfWeek?: number;

    @ApiProperty({ example: '08:00', description: 'Thời gian bắt đầu', required: false })
    @IsString()
    @IsOptional()
    startTime?: string;

    @ApiProperty({ example: '17:00', description: 'Thời gian kết thúc', required: false })
    @IsString()
    @IsOptional()
    endTime?: string;
}
