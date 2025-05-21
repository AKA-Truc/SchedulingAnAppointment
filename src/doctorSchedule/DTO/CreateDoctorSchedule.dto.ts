import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min, Max } from 'class-validator';

export class CreateDoctorSchedule {
    @ApiProperty({ example: 1, description: 'ID bác sĩ' })
    @IsInt()
    @IsNotEmpty()
    doctorId: number;

    @ApiProperty({ example: 2, description: 'Ngày trong tuần (0=Chủ nhật, 1=Thứ 2, ... 6=Thứ 7)' })
    @IsInt()
    @Min(0)
    @Max(6)
    dayOfWeek: number;

    @ApiProperty({ example: '08:00', description: 'Thời gian bắt đầu' })
    @IsString()
    @IsNotEmpty()
    startTime: string;

    @ApiProperty({ example: '17:00', description: 'Thời gian kết thúc' })
    @IsString()
    @IsNotEmpty()
    endTime: string;
}
