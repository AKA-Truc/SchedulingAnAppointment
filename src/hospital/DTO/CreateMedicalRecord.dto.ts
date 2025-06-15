import { IsInt, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMedicalRecordDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  userId: number;

  @ApiProperty({ example: 'Patient reports sore throat and cough for 3 days.' })
  @IsString()
  historyPresentIllness: string;

  @ApiProperty({ example: 'Sore throat' })
  @IsString()
  chiefComplaint: string;

  @ApiProperty({ example: 'Pharyngitis' })
  @IsString()
  diagnosis: string;

  @ApiProperty({ example: 'Rapid strep test: Positive' })
  @IsString()
  testResult: string;

  @ApiProperty({ example: 'Prescribed antibiotics. Advised rest and fluids.' })
  @IsString()
  doctorNotes: string;

  @ApiProperty({ example: '7-day course of Amoxicillin' })
  @IsString()
  treatmentPlan: string;

  @ApiProperty({ example: 'Full recovery within 10 days' })
  @IsString()
  treatmentGoals: string;
}

export class CreateMedicalRecordResponseDto {
    @ApiProperty({ type: CreateMedicalRecordDto })
    medicalRecord: CreateMedicalRecordDto;

    @ApiProperty({ example: 'Medical record created successfully.' })
    message: string;
}
