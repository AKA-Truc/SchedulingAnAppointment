import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateMedicalRecord {
    @ApiProperty({ example: 1, description: 'ID người dùng' })
    @IsInt()
    @IsNotEmpty()
    userId: number;

    @ApiProperty({ example: 'Triệu chứng xuất hiện từ 2 tuần trước và ngày càng nặng', description: 'Tiền sử bệnh hiện tại' })
    @IsString()
    @IsNotEmpty()
    historyPresentIllness: string;

    @ApiProperty({ example: 'Đau đầu và chóng mặt', description: 'Triệu chứng chính' })
    @IsString()
    @IsNotEmpty()
    chiefComplaint: string;

    @ApiProperty({ example: 'Tăng huyết áp giai đoạn 2', description: 'Chẩn đoán bệnh' })
    @IsString()
    @IsNotEmpty()
    diagnosis: string;

    @ApiProperty({ example: 'Xét nghiệm máu và điện tim bình thường', description: 'Kết quả xét nghiệm' })
    @IsString()
    @IsNotEmpty()
    testResult: string;

    @ApiProperty({ example: 'Bác sĩ khuyên bệnh nhân nên giảm muối và tập thể dục', description: 'Ghi chú của bác sĩ' })
    @IsString()
    @IsNotEmpty()
    doctorNotes: string;

    @ApiProperty({ example: 'Bắt đầu dùng thuốc và thay đổi lối sống', description: 'Kế hoạch điều trị' })
    @IsString()
    @IsNotEmpty()
    treatmentPlan: string;

    @ApiProperty({ example: 'Kiểm soát huyết áp về mức bình thường', description: 'Mục tiêu điều trị' })
    @IsString()
    @IsNotEmpty()
    treatmentGoals: string;
}
