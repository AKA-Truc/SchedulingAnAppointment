import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Gender, Role } from '@prisma/client';

export class CreateUserDto {
    @ApiProperty({
        example: 'Nguyễn Văn A',
        description: 'Họ và tên người dùng',
    })
    @IsString()
    @IsNotEmpty()
    fullName: string;

    @ApiProperty({
        example: 'nguyenvana@example.com',
        description: 'Email hợp lệ',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: '0909123456',
        description: 'Số điện thoại người dùng',
    })
    @IsString()
    @IsNotEmpty()
    phone: string;

    @ApiProperty({
        example: 'StrongPass123',
        description: 'Mật khẩu có ít nhất 8 ký tự',
        minLength: 8,
    })
    @IsString()
    @MinLength(8)
    password: string;

    @ApiProperty({
        example: Gender.Male,
        enum: Gender,
        description: 'Giới tính người dùng',
    })
    @IsEnum(Gender)
    gender: Gender;

    @ApiProperty({
        example: Role.USER,
        enum: Role,
        description: 'Vai trò của người dùng',
    })
    @IsEnum(Role)
    role: Role;
}
