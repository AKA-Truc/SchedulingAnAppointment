import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SpecialtyResponseDto {
    @ApiProperty({ example: '12345', description: 'ID chuyên khoa' })
    @IsString()
    id: string;

    @ApiProperty({ example: 'Cardiology' })
    @IsString()
    name: string;

    @ApiProperty(  { example: 'Chuyên khoa tim mạch', description: 'Mô tả chuyên khoa' })
    description: string;

    @ApiProperty({ example: 'fa-solid fa-heart-pulse' })
    icon: string;

    @ApiProperty({ example: 5 })
    doctorCount: number;
}
