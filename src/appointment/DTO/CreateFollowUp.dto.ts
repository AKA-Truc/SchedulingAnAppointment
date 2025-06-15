import { IsInt, IsDateString, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFollowUp {
  @ApiProperty({
    example: 123,
    description: 'ID của cuộc hẹn cần tạo theo dõi (appointmentId)',
  })
  @IsInt()
  appointmentId: number;

  @ApiProperty({
    example: '2025-05-21T09:00:00Z',
    description: 'Ngày hẹn tiếp theo (định dạng ISO YYYY-MM-DD)',
  })
  @IsDateString()
  nextDate: string;

  @ApiProperty({
    example: 'Tái khám sau điều trị viêm họng',
    description: 'Lý do theo dõi tiếp theo',
  })
  @IsString()
  reason: string;
}
