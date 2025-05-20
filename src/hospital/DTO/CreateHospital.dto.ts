import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreatePatientProfile {
    @ApiProperty({ example: 1, description: 'ID của người dùng (User_ID)' })
    @IsInt()
    userId: number;

    @ApiProperty({ example: 'Male', description: 'Giới tính' })
    @IsString()
    @IsNotEmpty()
    gender: string;

    @ApiProperty({ example: '1990-05-15', description: 'Ngày sinh (yyyy-mm-dd)' })
    @IsDateString()
    dateOfBirth: Date;

    @ApiProperty({ example: '123 Trần Hưng Đạo, Quận 1, TP.HCM', description: 'Địa chỉ' })
    @IsString()
    address: string;

    @ApiProperty({ example: 'Bảo hiểm y tế quốc gia', description: 'Thông tin bảo hiểm' })
    @IsString()
    insurance: string;

    @ApiProperty({ example: 'Penicillin', description: 'Dị ứng' })
    @IsString()
    allergies: string;

    @ApiProperty({ example: 'Tiểu đường, Tăng huyết áp', description: 'Bệnh mãn tính' })
    @IsString()
    chronicDiseases: string;

    @ApiProperty({ example: 'Sinh thường năm 2015', description: 'Tiền sử sản khoa' })
    @IsString()
    obstetricHistory: string;

    @ApiProperty({ example: 'Phẫu thuật ruột thừa năm 2010', description: 'Tiền sử phẫu thuật' })
    @IsString()
    surgicalHistory: string;

    @ApiProperty({ example: 'Bố bị cao huyết áp, mẹ tiểu đường', description: 'Tiền sử gia đình' })
    @IsString()
    familyHistory: string;

    @ApiProperty({ example: 'Hút thuốc nhẹ, không uống rượu', description: 'Tiền sử xã hội' })
    @IsString()
    socialHistory: string;

    @ApiProperty({ example: 'Metformin, Losartan', description: 'Lịch sử dùng thuốc' })
    @IsString()
    medicationHistory: string;
}
