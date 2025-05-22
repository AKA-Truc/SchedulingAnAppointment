import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsEmail, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreateHospital {
    @ApiProperty({ example: 'Bệnh viện Chợ Rẫy' })
    @IsString()
    name: string;

    @ApiProperty({ example: '201B Nguyễn Chí Thanh, Quận 5, TP.HCM' })
    @IsString()
    address: string;

    @ApiProperty({ example: '842838552792' })
    @IsString()
    phone: string;

    @ApiProperty({ example: 'Bệnh viện đa khoa tuyến trung ương' })
    @IsString()
    description: string;

    @ApiProperty({ example: 'choray@hospital.vn' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 1900 })
    @IsInt()
    establishYear: number;

    @ApiProperty({ example: 'public' })
    @IsString()
    type: string;

    @ApiProperty({ example: 'https://example.com/logo.png' })
    @IsString()
    logo: string;

    @ApiProperty({ example: '8:00-17:00 from Monday to Friday' })
    @IsString()
    workScheduling: string;

    @ApiProperty({ example: 'https://choray.vn', required: false })
    @IsUrl()
    @IsOptional()
    website?: string;
}