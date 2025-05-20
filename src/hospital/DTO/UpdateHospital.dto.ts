import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsEmail, IsOptional } from 'class-validator';

export class UpdateHospital {
    @ApiProperty({ example: 'Bệnh viện Chợ Rẫy', required: false })
    @IsString()
    @IsOptional()
    Name?: string;

    @ApiProperty({ example: '201B Nguyễn Chí Thanh, Quận 5, TP.HCM', required: false })
    @IsString()
    @IsOptional()
    Address?: string;

    @ApiProperty({ example: 842838552792, required: false })
    @IsInt()
    @IsOptional()
    Phone?: number;

    @ApiProperty({ example: 'Bệnh viện đa khoa tuyến trung ương', required: false })
    @IsString()
    @IsOptional()
    Description?: string;

    @ApiProperty({ example: 'choray@hospital.vn', required: false })
    @IsEmail()
    @IsOptional()
    Email?: string;

    @ApiProperty({ example: 1900, required: false })
    @IsInt()
    @IsOptional()
    establishYear?: number;

    @ApiProperty({ example: 'public', required: false })
    @IsString()
    @IsOptional()
    Type?: string;
}
