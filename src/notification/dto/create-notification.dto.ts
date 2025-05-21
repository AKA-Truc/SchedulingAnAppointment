import { IsString, IsEnum, IsInt, IsDate, IsBoolean, IsOptional } from 'class-validator';
import { NotificationType, NotificationMethod, NotificationTargetType } from '@prisma/client';

export class CreateNotificationDto {
    @IsEnum(NotificationType)
    type: NotificationType;

    @IsEnum(NotificationMethod)
    method: NotificationMethod;

    @IsString()
    title: string;

    @IsString()
    content: string;

    @IsInt()
    userId: number;

    @IsDate()
    remindAt: Date;

    @IsBoolean()
    @IsOptional()
    sent?: boolean;

    @IsEnum(NotificationTargetType)
    targetType: NotificationTargetType;

    @IsInt()
    targetId: number;

    @IsInt()
    @IsOptional()
    appointmentId?: number;

    @IsInt()
    @IsOptional()
    followUpId?: number;

    @IsInt()
    @IsOptional()
    medicalRecordId?: number;
}
