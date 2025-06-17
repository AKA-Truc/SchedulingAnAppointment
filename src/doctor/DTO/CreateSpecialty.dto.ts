import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSpecialty {
    @ApiProperty({
        example: 'Tim mạch',
        description: 'Tên chuyên khoa, ví dụ: Tim mạch, Da liễu, Nhi khoa...',
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        example: 'Chẩn đoán và điều trị các bệnh lý liên quan đến tim và mạch máu.',
        description: 'Mô tả ngắn gọn về chuyên khoa',
    })
    @IsString()
    @IsNotEmpty()
    description: string;
}
