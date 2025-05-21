import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsEmail, IsOptional, IsUrl } from 'class-validator';

export class UpdateHospital {
    @ApiProperty({ example: 'Bệnh viện Chợ Rẫy', required: false })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({ example: '201B Nguyễn Chí Thanh, Quận 5, TP.HCM', required: false })
    @IsString()
    @IsOptional()
    address?: string;

    @ApiProperty({ example: '842838552792', required: false })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiProperty({ example: 'Bệnh viện đa khoa tuyến trung ương', required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: 'choray@hospital.vn', required: false })
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiProperty({ example: 1900, required: false })
    @IsInt()
    @IsOptional()
    establishYear?: number;

    @ApiProperty({ example: 'public', required: false })
    @IsString()
    @IsOptional()
    type?: string;

    @ApiProperty({ example: 'https://example.com/logo.png', required: false })
    @IsString()
    @IsOptional()
    logo?: string;

    @ApiProperty({ example: '8:00-17:00 from Monday to Friday', required: false })
    @IsString()
    @IsOptional()
    workScheduling?: string;

    @ApiProperty({ example: 'https://choray.vn', required: false })
    @IsUrl()
    @IsOptional()
    website?: string;
}