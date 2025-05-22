import { IsInt, IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateFeedback {
    @ApiPropertyOptional({ example: 5, description: 'Đánh giá (1-5)' })
    @IsOptional()
    @IsInt()
    rating?: number;

    @ApiPropertyOptional({ example: 'Cải thiện thêm dịch vụ.', description: 'Nhận xét' })
    @IsOptional()
    @IsString()
    comment?: string;
}