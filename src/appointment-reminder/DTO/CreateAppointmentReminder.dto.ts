import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsInt } from 'class-validator';

export class CreateAppointmentReminder {
    @ApiProperty({ example: 1, description: 'ID cuộc hẹn (appointment)' })
    @IsInt()
    appointment_ID: number;

    @ApiProperty({ example: '2025-05-21T08:00:00Z', description: 'Ngày bắt đầu nhắc nhở' })
    @IsDateString()
    startDate: string;

    @ApiProperty({ example: '2025-05-21T07:00:00Z', description: 'Thời gian gửi nhắc nhở' })
    @IsDateString()
    remindAt: string;

    @ApiProperty({ example: false, description: 'Đã gửi nhắc nhở hay chưa' })
    @IsBoolean()
    sent: boolean;
}
