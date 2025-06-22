import { IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { GenderEnum, RoleEnum } from '@prisma/client';
import { Type } from 'class-transformer';

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
        example: '2004-02-02'
    })
    @IsOptional()
    @Type(() => Date)
    dateOfBirth?: Date;

    @ApiProperty({
        example: '20 Nguyen Thi Dinh, Ho Chi Minh'
    })
    @IsOptional()
    address?: string;

    @ApiProperty({
        example: '079346057694'
    })
    @IsOptional()
    nationalId?: string;

    @ApiProperty({
        example: 'Kinh'
    })
    @IsOptional()
    ethnicity?: string;

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
