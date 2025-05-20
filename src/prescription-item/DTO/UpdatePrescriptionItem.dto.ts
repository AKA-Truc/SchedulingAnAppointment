import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdatePrescriptionItem {
    @ApiProperty({ example: 1, description: 'ID bản ghi y tế', required: false })
    @IsInt()
    @IsOptional()
    MedicalRecord_ID?: number;

    @ApiProperty({ example: 'Paracetamol', description: 'Tên thuốc', required: false })
    @IsString()
    @IsOptional()
    medicineName?: string;

    @ApiProperty({ example: '500mg', description: 'Liều dùng', required: false })
    @IsString()
    @IsOptional()
    dosage?: string;

    @ApiProperty({ example: '3 lần/ngày', description: 'Tần suất dùng', required: false })
    @IsString()
    @IsOptional()
    frequency?: string;

    @ApiProperty({ example: '7 ngày', description: 'Thời gian dùng thuốc', required: false })
    @IsString()
    @IsOptional()
    duration?: string;

    @ApiProperty({ example: 'Uống sau khi ăn', description: 'Ghi chú', required: false })
    @IsString()
    @IsOptional()
    notes?: string;
}
