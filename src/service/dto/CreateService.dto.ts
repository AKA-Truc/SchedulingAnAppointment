import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsInt, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({
    example: "Khám dịch vụ",
    description: "Tên của dịch vụ khám",
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 200000,
    description: "Giá của dịch vụ (đơn vị: VNĐ)",
  })
  @IsNotEmpty()
  @IsInt()
  price: number;

  @ApiProperty({
    example: "30 phút",
    description: "Thời lượng khám",
    required: false,
  })
  @IsOptional()
  @IsString()
  duration?: string;

  @ApiProperty({
    example: true,
    description: "Dịch vụ nổi bật",
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  highlighted?: boolean;

  @ApiProperty({
    example: [
      "Tư vấn trực tiếp với bác sĩ",
      "Chẩn đoán sơ bộ",
      "Kê đơn thuốc (nếu cần)",
      "Hỗ trợ sau khám 24h"
    ],
    description: "Danh sách mô tả tính năng dịch vụ",
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  description?: string[];

  @ApiProperty({
    example: "Thứ Hai đến Chủ Nhật (8:00 - 17:00)",
    description: "Lịch làm việc của dịch vụ",
  })
  @IsNotEmpty()
  @IsString()
  calender: string;
}
