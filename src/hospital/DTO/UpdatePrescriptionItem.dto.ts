import { PartialType } from '@nestjs/swagger';
import { CreatePrescriptionItemDto } from './CreatePrescriptionItem.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePrescriptionItemDto extends PartialType(CreatePrescriptionItemDto) {}
export class UpdatePrescriptionItemResponseDto {
    @ApiProperty({ example: 'Prescription item updated successfully' })
    message: string;

    @ApiProperty({ type: UpdatePrescriptionItemDto })
    data: UpdatePrescriptionItemDto;
}
