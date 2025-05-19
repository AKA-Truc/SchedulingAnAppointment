import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
    @ApiProperty({
        example: 'user@example.com',
        description: 'Email đã đăng ký tài khoản',
    })
    @IsEmail()
    email: string;
}
