import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsInt } from 'class-validator';

export class CreateServiceDto {
    @ApiProperty({
        example: "Khám dịch vụ"
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        example: "200000"
    })
    @IsNotEmpty()
    @IsInt()
    price: number;

    @ApiProperty({
        example: "Các ngày trong tuần"
    })
    @IsNotEmpty()
    @IsString()
    calender: string;
}
