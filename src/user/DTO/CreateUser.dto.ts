import { IsEmail, IsEnum, IsInt, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { GenderEmun, RoleEnum } from '@prisma/client';

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
    @IsInt()
    @IsNotEmpty()
    phone: number;

    @ApiProperty({
        example: 'StrongPass123',
        description: 'Mật khẩu có ít nhất 8 ký tự',
        minLength: 8,
    })
    @IsString()
    @MinLength(8)
    password: string;

    @ApiProperty({
        example: GenderEmun.Male,
        enum: GenderEmun,
        description: 'Giới tính người dùng',
    })
    @IsEnum(GenderEmun)
    gender: GenderEmun;

    @ApiProperty({
        example: RoleEnum.USER,
        enum: RoleEnum,
        description: 'Vai trò của người dùng',
    })
    @IsEnum(RoleEnum)
    role: RoleEnum;
}
