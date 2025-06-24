import { IsNotEmpty, IsEnum, IsString, IsArray, IsOptional, IsDateString } from 'class-validator';
import { ConsentTypeEnum, ConsentStatusEnum } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConsentDto {
  @ApiProperty({ enum: ConsentTypeEnum })
  @IsNotEmpty()
  @IsEnum(ConsentTypeEnum)
  consentType: ConsentTypeEnum;

  @ApiProperty({ enum: ConsentStatusEnum })
  @IsNotEmpty()
  @IsEnum(ConsentStatusEnum)
  status: ConsentStatusEnum;

  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ type: [String] })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  scope: string[];

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  terms: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  witness?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  witnessContact?: string;
}
