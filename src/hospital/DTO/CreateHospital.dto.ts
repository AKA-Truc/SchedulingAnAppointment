import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsEmail, IsNotEmpty } from 'class-validator';

export class CreateHospital {
    @ApiProperty({ example: 'Bệnh viện Chợ Rẫy' })
    @IsString()
    @IsNotEmpty()
    Name: string;

    @ApiProperty({ example: '201B Nguyễn Chí Thanh, Quận 5, TP.HCM' })
    @IsString()
    @IsNotEmpty()
    Address: string;

    @ApiProperty({ example: 842838552792 })
    @IsInt()
    @IsNotEmpty()
    Phone: number;

    @ApiProperty({ example: 'Bệnh viện đa khoa tuyến trung ương' })
    @IsString()
    @IsNotEmpty()
    Description: string;

    @ApiProperty({ example: 'choray@hospital.vn' })
    @IsEmail()
    Email: string;

    @ApiProperty({ example: 1900 })
    @IsInt()
    establishYear: number;

    @ApiProperty({ example: 'public' })
    @IsString()
    @IsNotEmpty()
    Type: string;
}
