import { IsInt, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateDoctor {
    @IsInt()
    userId: number;

    @IsInt()
    specialtyId: number;

    @IsInt()
    hospitalId: number;

    @IsInt()
    phone: number;

    @IsNumber()
    rating: number;

    @IsString()
    bio: string;

    @IsString()
    yearsOfExperience: string;

    @IsString()
    certifications: string;

    @IsString()
    @IsOptional()
    website?: string;

    @IsString()
    education: string;
}
