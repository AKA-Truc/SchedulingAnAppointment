import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdatePatientProfile {
    @ApiProperty({ example: 1, description: 'ID của người dùng (User_ID)' })
    @IsOptional()
    @IsInt()
    userId?: number;

    @ApiProperty({ example: 'Male', description: 'Giới tính' })
    @IsOptional()
    @IsString()
    gender?: string;

    @ApiProperty({ example: '1990-05-15', description: 'Ngày sinh (yyyy-mm-dd)' })
    @IsOptional()
    @IsDateString()
    dateOfBirth?: Date;

    @ApiProperty({ example: '123 Trần Hưng Đạo, Quận 1, TP.HCM', description: 'Địa chỉ' })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiProperty({ example: 'Bảo hiểm y tế quốc gia', description: 'Thông tin bảo hiểm' })
    @IsOptional()
    @IsString()
    insurance?: string;

    @ApiProperty({ example: 'Penicillin', description: 'Dị ứng' })
    @IsOptional()
    @IsString()
    allergies?: string;

    @ApiProperty({ example: 'Tiểu đường, Tăng huyết áp', description: 'Bệnh mãn tính' })
    @IsOptional()
    @IsString()
    chronicDiseases?: string;

    @ApiProperty({ example: 'Sinh thường năm 2015', description: 'Tiền sử sản khoa' })
    @IsOptional()
    @IsString()
    obstetricHistory?: string;

    @ApiProperty({ example: 'Phẫu thuật ruột thừa năm 2010', description: 'Tiền sử phẫu thuật' })
    @IsOptional()
    @IsString()
    surgicalHistory?: string;

    @ApiProperty({ example: 'Bố bị cao huyết áp, mẹ tiểu đường', description: 'Tiền sử gia đình' })
    @IsOptional()
    @IsString()
    familyHistory?: string;

    @ApiProperty({ example: 'Hút thuốc nhẹ, không uống rượu', description: 'Tiền sử xã hội' })
    @IsOptional()
    @IsString()
    socialHistory?: string;

    @ApiProperty({ example: 'Metformin, Losartan', description: 'Lịch sử dùng thuốc' })
    @IsOptional()
    @IsString()
    medicationHistory?: string;
}
