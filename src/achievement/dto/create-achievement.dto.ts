import { IsString, IsOptional, IsNumber, IsDate } from 'class-validator';

export class CreateAchievementDto {
    @IsString()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsDate()
    @IsOptional()
    dateAchieved?: Date;

    @IsNumber()
    @IsOptional()
    doctorId?: number;

    @IsNumber()
    @IsOptional()
    hospitalId?: number;
}
