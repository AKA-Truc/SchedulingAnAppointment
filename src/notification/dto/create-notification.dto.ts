import { IsString, IsEnum, IsInt, IsDate, IsBoolean, IsOptional } from 'class-validator';
import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
    @IsEnum(NotificationType)
    type: NotificationType;

    @IsString()
    title: string;

    @IsString()
    content: string;

    @IsInt()
    userId: number;

    @IsInt()
    appointmentId: number;

    @IsDate()
    remindAt: Date;

    @IsBoolean()
    @IsOptional()
    sent?: boolean;

    @IsInt()
    @IsOptional()
    followUpId?: number;

    @IsInt()
    @IsOptional()
    medicalRecordId?: number;

    @IsDate()
    scheduledTime: Date;
}
