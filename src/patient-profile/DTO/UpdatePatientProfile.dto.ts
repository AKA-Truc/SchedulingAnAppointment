// src/patient-profile/dto/UpdatePatientProfile.dto.ts
import { IsInt, IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdatePatientProfile {
  @ApiPropertyOptional({ description: 'User ID của bệnh nhân', example: 123 })
  @IsOptional()
  @IsInt()
  userId?: number;

  @ApiPropertyOptional({ description: 'Số bảo hiểm y tế' })
  @IsOptional()
  @IsString()
  insurance?: string;

  @ApiPropertyOptional({ description: 'Dị ứng' })
  @IsOptional()
  @IsString()
  allergies?: string;

  @ApiPropertyOptional({ description: 'Bệnh mãn tính' })
  @IsOptional()
  @IsString()
  chronicDiseases?: string;

  @ApiPropertyOptional({ description: 'Tiền sử sản khoa' })
  @IsOptional()
  @IsString()
  obstetricHistory?: string;

  @ApiPropertyOptional({ description: 'Tiền sử phẫu thuật' })
  @IsOptional()
  @IsString()
  surgicalHistory?: string;

  @ApiPropertyOptional({ description: 'Tiền sử gia đình' })
  @IsOptional()
  @IsString()
  familyHistory?: string;

  @ApiPropertyOptional({ description: 'Tiền sử xã hội' })
  @IsOptional()
  @IsString()
  socialHistory?: string;

  @ApiPropertyOptional({ description: 'Tiền sử dùng thuốc' })
  @IsOptional()
  @IsString()
  medicationHistory?: string;
}
