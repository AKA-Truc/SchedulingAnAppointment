import { IsInt, IsOptional, IsString, IsNumber, IsUrl, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDoctor {
    @ApiPropertyOptional({ example: 1, description: 'ID người dùng liên kết với bác sĩ' })
    @IsOptional()
    @IsInt()
    userId?: number;

    @ApiPropertyOptional({ example: 1, description: 'ID bác sĩ' })
    @IsOptional()
    @IsInt()
    doctorId?: number;

    @ApiPropertyOptional({ example: 2, description: 'ID chuyên khoa của bác sĩ' })
    @IsOptional()
    @IsInt()
    specialtyId?: number;

    @ApiPropertyOptional({ example: 3, description: 'ID bệnh viện mà bác sĩ làm việc' })
    @IsOptional()
    @IsInt()
    hospitalId?: number;

    @ApiPropertyOptional({ example: 4.5, description: 'Đánh giá bác sĩ từ 0.0 đến 5.0' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(5)
    rating?: number;

    @ApiPropertyOptional({ example: 'Bác sĩ chuyên khoa tim mạch với hơn 10 năm kinh nghiệm', description: 'Tiểu sử ngắn của bác sĩ' })
    @IsOptional()
    @IsString()
    bio?: string;

    @ApiPropertyOptional({ example: '10 năm', description: 'Số năm kinh nghiệm của bác sĩ' })
    @IsOptional()
    @IsString()
    yearsOfExperience?: string;

    @ApiPropertyOptional({ example: 'Đại học Y Dược TP.HCM', description: 'Trình độ học vấn của bác sĩ' })
    @IsOptional()
    @IsString()
    education?: string;

    @ApiPropertyOptional({ example: 'Phòng khám Đa khoa ABC', description: 'Tên phòng khám nơi bác sĩ làm việc' })
    @IsOptional()
    @IsString()
    clinic?: string;
}
