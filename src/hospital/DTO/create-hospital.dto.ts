import { IsString, IsInt, IsEmail, IsOptional } from 'class-validator';

export class CreateHospital {
    @IsString()
    Name: string;

    @IsString()
    Address: string;

    @IsInt()
    Phone: number;

    @IsString()
    Description: string;

    @IsEmail()
    Email: string;

    @IsInt()
    establishYear: number;

    @IsString()
    Type: string;

    @IsString()
    @IsOptional()
    website?: string;
}
