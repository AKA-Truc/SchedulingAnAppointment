import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, IsDateString } from 'class-validator';

export class CreateFollowUp {
    @ApiProperty({ example: 1, description: 'ID cuộc hẹn' })
    @IsInt()
    @IsNotEmpty()
    appointmentId: number;

    @ApiProperty({ example: '2025-06-01T10:00:00Z', description: 'Ngày tái khám' })
    @IsDateString()
    @IsNotEmpty()
    nextDate: string;

    @ApiProperty({ example: 'Cần tái khám để theo dõi huyết áp', description: 'Lý do tái khám' })
    @IsString()
    @IsNotEmpty()
    reason: string;
}
