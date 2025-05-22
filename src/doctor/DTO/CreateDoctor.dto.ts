import { IsInt, IsNotEmpty, IsOptional, IsString, IsNumber, IsUrl, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDoctor {
    @ApiProperty({
        example: 1,
        description: 'ID người dùng liên kết với bác sĩ',
    })
    @IsInt()
    @IsNotEmpty()
    userId: number;

    @ApiProperty({
        example: 2,
        description: 'ID chuyên khoa của bác sĩ',
    })
    @IsInt()
    @IsNotEmpty()
    specialtyId: number;

    @ApiProperty({
        example: 3,
        description: 'ID bệnh viện mà bác sĩ làm việc',
    })
    @IsInt()
    @IsNotEmpty()
    hospitalId: number;
}
