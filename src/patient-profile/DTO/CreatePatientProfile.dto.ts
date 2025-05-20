import { IsString, IsInt, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePatientProfile {
    @ApiProperty()
    @IsInt()
    userId: number;

    @ApiProperty()
    @IsString()
    gender: string;

    @ApiProperty()
    @IsDateString()
    dateOfBirth: Date;

    @ApiProperty()
    @IsString()
    address: string;

    @ApiProperty()
    @IsString()
    insurance: string;

    @ApiProperty()
    @IsString()
    allergies: string;

    @ApiProperty()
    @IsString()
    chronicDiseases: string;

    @ApiProperty()
    @IsString()
    obstetricHistory: string;

    @ApiProperty()
    @IsString()
    surgicalHistory: string;

    @ApiProperty()
    @IsString()
    familyHistory: string;

    @ApiProperty()
    @IsString()
    socialHistory: string;

    @ApiProperty()
    @IsString()
    medicationHistory: string;
}
