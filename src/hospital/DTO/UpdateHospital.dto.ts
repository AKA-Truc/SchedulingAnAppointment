import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsEmail, IsOptional, IsUrl, IsNumber, IsBoolean } from 'class-validator';

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

    @ApiProperty({ example: 10.7542, required: false })
    @IsNumber()
    @IsOptional()
    latitude?: number;

    @ApiProperty({ example: 106.6621, required: false })
    @IsOptional()
    @IsNumber()
    longitude?: number;

    @ApiProperty({ example: '[]', required: false, description: 'JSON string of gallery image URLs' })
    @IsString()
    @IsOptional()
    gallery?: string;

    @ApiProperty({ example: '[]', required: false, description: 'JSON string of certificate data' })
    @IsString()
    @IsOptional()
    certificates?: string;

    @ApiProperty({ example: 4.5, required: false })
    @IsNumber()
    @IsOptional()
    rating?: number;

    @ApiProperty({ example: 150, required: false })
    @IsNumber()
    @IsOptional()
    reviews?: number;

    @ApiProperty({ example: true, required: false })
    @IsBoolean()
    @IsOptional()
    verified?: boolean;

    @ApiProperty({ example: 200, required: false })
    @IsNumber()
    @IsOptional()
    totalBeds?: number;

    @ApiProperty({ example: 50, required: false })
    @IsNumber()
    @IsOptional()
    totalNurses?: number;
}