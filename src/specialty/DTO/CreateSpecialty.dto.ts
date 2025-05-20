import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSpecialty {
    @ApiProperty({
        example: 'Cardiology',
        description: 'Tên chuyên khoa',
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        example: 'Chuyên khoa tim mạch',
        description: 'Mô tả chuyên khoa',
    })
    @IsString()
    @IsNotEmpty()
    description: string;
}