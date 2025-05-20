import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSpecialty {
    @ApiProperty({
        example: 'Cardiology',
        description: 'Tên chuyên khoa',
        required: false,
    })
    @IsString()
    name?: string;

    @ApiProperty({
        example: 'Chuyên khoa tim mạch',
        description: 'Mô tả chuyên khoa',
        required: false,
    })
    @IsString()
    description?: string;
}