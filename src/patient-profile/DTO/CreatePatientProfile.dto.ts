// src/patient-profile/dto/CreatePatientProfile.dto.ts
import { IsInt, IsString, IsOptional, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePatientProfile {
  @ApiProperty({ description: 'User ID của bệnh nhân', example: 123 })
  @IsInt()
  userId: number;

  @ApiProperty({ description: 'Giới tính', example: 'Male' })
  @IsString()
  gender: string;

  @ApiProperty({ description: 'Ngày sinh', type: String, example: '1980-01-01' })
  @Type(() => Date)
  @IsDate()
  dateOfBirth: Date;

  @ApiProperty({ description: 'Địa chỉ', example: '123 Đường A, Quận B' })
  @IsString()
  address: string;

  @ApiProperty({ description: 'Số bảo hiểm y tế', required: false })
  @IsOptional()
  @IsString()
  insurance?: string;

  @ApiProperty({ description: 'Dị ứng', required: false })
  @IsOptional()
  @IsString()
  allergies?: string;

  @ApiProperty({ description: 'Bệnh mãn tính', required: false })
  @IsOptional()
  @IsString()
  chronicDiseases?: string;

  @ApiProperty({ description: 'Tiền sử sản khoa', required: false })
  @IsOptional()
  @IsString()
  obstetricHistory?: string;

  @ApiProperty({ description: 'Tiền sử phẫu thuật', required: false })
  @IsOptional()
  @IsString()
  surgicalHistory?: string;

  @ApiProperty({ description: 'Tiền sử gia đình', required: false })
  @IsOptional()
  @IsString()
  familyHistory?: string;

  @ApiProperty({ description: 'Tiền sử xã hội', required: false })
  @IsOptional()
  @IsString()
  socialHistory?: string;

  @ApiProperty({ description: 'Tiền sử dùng thuốc', required: false })
  @IsOptional()
  @IsString()
  medicationHistory?: string;
}
