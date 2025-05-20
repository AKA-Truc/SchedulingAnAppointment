import { IsInt, IsNotEmpty, IsOptional, IsString, IsNumber, IsUrl, Min, Max, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDoctor {
    @ApiProperty({
        example: 1,
        description: 'ID người dùng liên kết với bác sĩ',
    })
    @IsInt()
    @IsNotEmpty()
    userId: number;

    @ApiProperty({
        example: 2,
        description: 'ID chuyên khoa của bác sĩ',
    })
    @IsInt()
    @IsNotEmpty()
    specialtyId: number;

    @ApiProperty({
        example: 3,
        description: 'ID bệnh viện mà bác sĩ làm việc',
    })
    @IsInt()
    @IsNotEmpty()
    hospitalId: number;

    @ApiProperty({
        example: 909123456,
        description: 'Số điện thoại của bác sĩ',
    })
    @IsInt()
    @IsNotEmpty()
    phone: number;

    @ApiProperty({
        example: 4.5,
        description: 'Đánh giá bác sĩ từ 0.0 đến 5.0',
    })
    @IsNumber()
    @Min(0)
    @Max(5)
    rating: number;

    @ApiProperty({
        example: 'Bác sĩ chuyên khoa tim mạch với 10 năm kinh nghiệm.',
        description: 'Tiểu sử ngắn của bác sĩ',
    })
    @IsString()
    @IsNotEmpty()
    bio: string;

    @ApiProperty({
        example: '10 năm',
        description: 'Số năm kinh nghiệm của bác sĩ',
    })
    @IsString()
    @IsNotEmpty()
    yearsOfExperience: string;

    @ApiProperty({
        example: 'Chứng chỉ chuyên khoa tim mạch, đào tạo y học cổ truyền',
        description: 'Chứng chỉ, bằng cấp của bác sĩ',
    })
    @IsString()
    @IsNotEmpty()
    certifications: string;

    @ApiProperty({
        example: 'https://doctorwebsite.com',
        description: 'Website cá nhân của bác sĩ',
        required: false,
    })
    @IsOptional()
    @IsUrl()
    website?: string;
}
