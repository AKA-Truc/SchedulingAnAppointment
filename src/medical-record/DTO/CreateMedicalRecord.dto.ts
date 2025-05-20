import { ApiProperty } from '@nestjs/swagger';

export class CreateMedicalRecord {
    @ApiProperty({ example: 1, description: 'ID cuộc hẹn' })
    Appointment_ID: number;

    @ApiProperty({ example: 'Bệnh nhân bị tăng huyết áp', description: 'Chẩn đoán bệnh' })
    Diagnosis: string;

    @ApiProperty({ example: 'Thuốc Lisinopril 10mg mỗi ngày', description: 'Đơn thuốc' })
    Prescription: string;

    @ApiProperty({ example: 'Xét nghiệm máu và điện tim bình thường', description: 'Kết quả xét nghiệm' })
    Test_Result: string;

    @ApiProperty({ example: 'Bác sĩ khuyên bệnh nhân nên giảm muối và tập thể dục', description: 'Ghi chú của bác sĩ' })
    Doctor_notes: string;

    @ApiProperty({ example: 'Đau đầu và chóng mặt', description: 'Triệu chứng chính' })
    ChiefComplaint: string;

    @ApiProperty({ example: 'Triệu chứng xuất hiện từ 2 tuần trước và ngày càng nặng', description: 'Tiền sử bệnh hiện tại' })
    historyPresentIllness: string;

    @ApiProperty({ example: 'Huyết áp 160/100, mạch 80 lần/phút', description: 'Khám thể chất' })
    physicalExam: string;

    @ApiProperty({ example: 'Kiểm soát huyết áp về mức bình thường', description: 'Mục tiêu điều trị' })
    treatmentGoals: string;

    @ApiProperty({ example: 'Tăng huyết áp giai đoạn 2', description: 'Đánh giá bệnh' })
    assessment: string;

    @ApiProperty({ example: 'Bắt đầu dùng thuốc và thay đổi lối sống', description: 'Kế hoạch điều trị' })
    treatmentPlan: string;

    @ApiProperty({ example: 'Chế độ ăn giảm muối, tập thể dục đều đặn', description: 'Kế hoạch không dùng thuốc' })
    nonDrugPlan: string;

    @ApiProperty({ example: 'Cung cấp tài liệu giáo dục về bệnh tăng huyết áp', description: 'Giáo dục bệnh nhân' })
    education: string;
}
