import { ApiProperty } from "@nestjs/swagger";
import { GenderEnum, RoleEnum } from "@prisma/client";
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from "class-validator";

export class RegisterDTO {
    @ApiProperty({
        example: 'Nguyễn Văn A',
        description: 'Họ và tên người dùng',
    })
    @IsString()
    @IsNotEmpty()
    fullName: string;

    @ApiProperty({
        example: 'nguyenvana@example.com',
        description: 'email hợp lệ',
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
        example: GenderEnum.Male,
        enum: GenderEnum,
        description: 'Giới tính người dùng',
    })
    @IsEnum(GenderEnum)
    gender: GenderEnum;

    @ApiProperty({
        example: RoleEnum.USER,
        enum: RoleEnum,
        description: 'Vai trò của người dùng',
    })
    @IsEnum(RoleEnum)
    role: RoleEnum;
}