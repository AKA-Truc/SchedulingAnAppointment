import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
    @ApiProperty({ example: 'user@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: '123456',
        description: 'Mã xác thực OTP đã gửi đến email của bạn',
    })
    @IsNotEmpty()
    code: string;
}
