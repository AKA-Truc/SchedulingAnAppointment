import { IsString, IsOptional, IsNumber, IsDate } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAchievement {
    @ApiProperty({ description: 'Tên thành tựu', example: 'Best Cardiologist Award' })
    @IsString()
    title: string;

    @ApiPropertyOptional({ description: 'Mô tả thành tựu', example: 'Awarded for outstanding performance' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ description: 'Ngày đạt được', example: '2024-12-15T00:00:00Z', type: String, format: 'date-time' })
    @IsDate()
    @IsOptional()
    dateAchieved?: Date;

    @ApiPropertyOptional({ description: 'ID của bác sĩ liên quan', example: 5 })
    @IsNumber()
    @IsOptional()
    doctorId?: number;

    @ApiPropertyOptional({ description: 'ID của bệnh viện liên quan', example: 3 })
    @IsNumber()
    @IsOptional()
    hospitalId?: number;
}
