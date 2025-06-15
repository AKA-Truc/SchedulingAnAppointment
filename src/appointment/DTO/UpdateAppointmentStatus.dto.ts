import { AppointmentStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAppointmentStatusDto {
  @ApiProperty({
    example: AppointmentStatus.SCHEDULED,
    enum: AppointmentStatus,
    description: 'Tình trạng đặt lịch',
  })
  @IsEnum(AppointmentStatus)
  status: AppointmentStatus;
}
