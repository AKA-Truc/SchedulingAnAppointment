import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSpecialty {
    @ApiPropertyOptional({ example: 'Cardiology' })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional({ example: 'Mô tả mới chuyên khoa tim mạch' })
    @IsString()
    @IsOptional()
    description?: string;
}
