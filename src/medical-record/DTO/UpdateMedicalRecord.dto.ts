import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateMedicalRecord {
    @ApiProperty({ example: 'Triệu chứng xuất hiện từ 2 tuần trước và ngày càng nặng', description: 'Tiền sử bệnh hiện tại', required: false })
    @IsString()
    @IsOptional()
    historyPresentIllness?: string;

    @ApiProperty({ example: 1, description: 'ID người dùng' })
    @IsInt()
    userId: number;

    @ApiProperty({ example: 'Đau đầu và chóng mặt', description: 'Triệu chứng chính', required: false })
    @IsString()
    @IsOptional()
    chiefComplaint?: string;

    @ApiProperty({ example: 'Tăng huyết áp giai đoạn 2', description: 'Chẩn đoán bệnh', required: false })
    @IsString()
    @IsOptional()
    diagnosis?: string;

    @ApiProperty({ example: 'Xét nghiệm máu và điện tim bình thường', description: 'Kết quả xét nghiệm', required: false })
    @IsString()
    @IsOptional()
    testResult?: string;

    @ApiProperty({ example: 'Bác sĩ khuyên bệnh nhân nên giảm muối và tập thể dục', description: 'Ghi chú của bác sĩ', required: false })
    @IsString()
    @IsOptional()
    doctorNotes?: string;

    @ApiProperty({ example: 'Bắt đầu dùng thuốc và thay đổi lối sống', description: 'Kế hoạch điều trị', required: false })
    @IsString()
    @IsOptional()
    treatmentPlan?: string;

    @ApiProperty({ example: 'Kiểm soát huyết áp về mức bình thường', description: 'Mục tiêu điều trị', required: false })
    @IsString()
    @IsOptional()
    treatmentGoals?: string;
}
