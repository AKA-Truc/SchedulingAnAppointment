import { IsString, IsEnum, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum NotificationType {
  INFO = 'INFO',
  WARNING = 'WARNING',
  URGENT = 'URGENT',
  ANNOUNCEMENT = 'ANNOUNCEMENT'
}

export class CreateBroadcastNotification {
  @ApiProperty({
    description: 'Tiêu đề thông báo',
    example: 'Thông báo bảo trì hệ thống'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description: 'Nội dung thông báo',
    example: 'Hệ thống sẽ được bảo trì từ 2:00 - 4:00 sáng ngày mai'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  content: string;

  @ApiProperty({
    description: 'Loại thông báo',
    enum: NotificationType,
    example: NotificationType.INFO
  })
  @IsEnum(NotificationType)
  type: NotificationType;
} 