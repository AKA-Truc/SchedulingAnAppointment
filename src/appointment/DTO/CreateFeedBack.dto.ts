import { IsInt, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFeedback {
    @ApiProperty({ example: 1, description: 'ID cuộc hẹn' })
    @IsInt()
    appointmentId: number;

    @ApiProperty({ example: 5, description: 'Đánh giá (1-5)' })
    @IsInt()
    rating: number;

    @ApiProperty({ example: 'Dịch vụ rất tốt!', description: 'Nhận xét' })
    @IsString()
    comment: string;
}