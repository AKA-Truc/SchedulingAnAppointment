import { IsOptional, IsString, IsNumber, Min } from 'class-validator';

export class HospitalFilterDto {
    @IsOptional()
    @IsString()
    type?: string;

    @IsOptional()
    @IsString()
    name?: string;

    //   @IsOptional()
    //   @IsNumber()
    //   @Min(0)
    //   skip?: number;

    //   @IsOptional()
    //   @IsNumber()
    //   @Min(1)
    //   take?: number;
}
