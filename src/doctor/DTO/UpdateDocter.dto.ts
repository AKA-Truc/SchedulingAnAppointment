import { IsInt, IsOptional, IsString, IsNumber, IsUrl, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDoctor {
    @ApiPropertyOptional({ example: 1, description: 'ID người dùng liên kết với bác sĩ' })
    @IsOptional()
    @IsInt()
    userId?: number;

    @ApiPropertyOptional({ example: 2, description: 'ID chuyên khoa của bác sĩ' })
    @IsOptional()
    @IsInt()
    specialtyId?: number;

    @ApiPropertyOptional({ example: 3, description: 'ID bệnh viện mà bác sĩ làm việc' })
    @IsOptional()
    @IsInt()
    hospitalId?: number;

    @ApiPropertyOptional({ example: 909123456, description: 'Số điện thoại của bác sĩ' })
    @IsOptional()
    @IsInt()
    phone?: number;

    @ApiPropertyOptional({ example: 4.5, description: 'Đánh giá bác sĩ từ 0.0 đến 5.0' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(5)
    rating?: number;

    @ApiPropertyOptional({ example: 'Tiểu sử bác sĩ...', description: 'Tiểu sử ngắn của bác sĩ' })
    @IsOptional()
    @IsString()
    bio?: string;

    @ApiPropertyOptional({ example: '10 năm', description: 'Số năm kinh nghiệm của bác sĩ' })
    @IsOptional()
    @IsString()
    yearsOfExperience?: string;

    @ApiPropertyOptional({ example: 'Chứng chỉ chuyên khoa...', description: 'Chứng chỉ, bằng cấp của bác sĩ' })
    @IsOptional()
    @IsString()
    certifications?: string;

    @ApiPropertyOptional({ example: 'https://doctorwebsite.com', description: 'Website cá nhân của bác sĩ' })
    @IsOptional()
    @IsUrl()
    website?: string;
}
