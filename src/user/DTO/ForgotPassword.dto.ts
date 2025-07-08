import { IsEmail, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
    @ApiProperty({
        example: 'user@example.com',
        description: 'email đã đăng ký tài khoản',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: '12345678',
        description: 'Mật khẩu mới của người dùng',
    })
    @MinLength(8)
    @MaxLength(20)
    newPassword: string;
}
