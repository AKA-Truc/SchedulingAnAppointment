import { IsInt, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePrescriptionItemDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  medicalRecordId: number;

  @ApiProperty({ example: 'Amoxicillin' })
  @IsString()
  @IsNotEmpty()
  medicineName: string;

  @ApiProperty({ example: '500mg' })
  @IsString()
  @IsNotEmpty()
  dosage: string;

  @ApiProperty({ example: 'Twice a day' })
  @IsString()
  @IsNotEmpty()
  frequency: string;

  @ApiProperty({ example: '7 days' })
  @IsString()
  @IsNotEmpty()
  duration: string;

  @ApiProperty({ example: 'Take with food to avoid stomach upset.' })
  @IsString()
  @IsNotEmpty()
  notes: string;
}

export class CreatePrescriptionItemResponseDto {
  @ApiProperty({ example: 'Prescription item created successfully' })
  message: string;

  @ApiProperty({ type: CreatePrescriptionItemDto })
  data: CreatePrescriptionItemDto;
}