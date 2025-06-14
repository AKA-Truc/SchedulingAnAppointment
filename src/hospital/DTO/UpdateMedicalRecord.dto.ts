import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateMedicalRecordDto } from './CreateMedicalRecord.dto';

export class UpdateMedicalRecordDto extends PartialType(CreateMedicalRecordDto) {}

export class UpdateMedicalRecordResponseDto {
  @ApiProperty({ example: 'Medical record updated successfully' })
  message: string;

  @ApiProperty({ type: UpdateMedicalRecordDto })
  data: UpdateMedicalRecordDto;
}
