import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
    @ApiProperty({
        example: 'nguyenvana@example.com',
        description: 'Email người dùng đã đăng ký',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: 'StrongPass123',
        description: 'Mật khẩu tối thiểu 8 ký tự',
        minLength: 8,
    })
    @IsString()
    @MinLength(8)
    password: string;
}