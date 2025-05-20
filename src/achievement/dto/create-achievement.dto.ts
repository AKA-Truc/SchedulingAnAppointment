import { IsString, IsOptional, IsNumber, IsDate } from 'class-validator';

export class CreateAchievementDto {
    @IsString()
    Title: string;

    @IsString()
    @IsOptional()
    Description?: string;

    @IsDate()
    @IsOptional()
    DateAchieved?: Date;

    @IsNumber()
    @IsOptional()
    Doctor_ID?: number;

    @IsNumber()
    @IsOptional()
    Hospital_ID?: number;
}
