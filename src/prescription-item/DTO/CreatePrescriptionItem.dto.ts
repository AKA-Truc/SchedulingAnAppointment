import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreatePrescriptionItem {
    @ApiProperty({ example: 1, description: 'ID bản ghi y tế' })
    @IsInt()
    @IsNotEmpty()
    medicalRecordId: number;

    @ApiProperty({ example: 'Paracetamol', description: 'Tên thuốc' })
    @IsString()
    @IsNotEmpty()
    medicineName: string;

    @ApiProperty({ example: '500mg', description: 'Liều dùng' })
    @IsString()
    @IsNotEmpty()
    dosage: string;

    @ApiProperty({ example: '3 lần/ngày', description: 'Tần suất dùng' })
    @IsString()
    @IsNotEmpty()
    frequency: string;

    @ApiProperty({ example: '7 ngày', description: 'Thời gian dùng thuốc' })
    @IsString()
    @IsNotEmpty()
    duration: string;

    @ApiProperty({ example: 'Uống sau khi ăn', description: 'Ghi chú' })
    @IsString()
    @IsNotEmpty()
    notes: string;
}
