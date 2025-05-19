import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role, Gender } from '@prisma/client';

export class UpdateUserDto {
    @ApiPropertyOptional({
        example: 'Nguyễn Văn B',
        description: 'Họ và tên mới của người dùng',
    })
    @IsOptional()
    @IsString()
    fullName?: string;

    @ApiPropertyOptional({
        example: 'nguyenvanb@example.com',
        description: 'Email mới',
    })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({
        example: '0912345678',
        description: 'Số điện thoại mới',
    })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({
        example: 'NewPass123',
        description: 'Mật khẩu mới, ít nhất 8 ký tự',
        minLength: 8,
    })
    @IsOptional()
    @IsString()
    @MinLength(8)
    password?: string;

    @ApiPropertyOptional({
        example: Gender.Male,
        enum: Gender,
        description: 'Giới tính người dùng',
    })
    @IsEnum(Gender)
    gender: Gender;

    @ApiPropertyOptional({
        example: Role.ADMIN,
        enum: Role,
        description: 'Vai trò mới của người dùng',
    })
    @IsOptional()
    @IsEnum(Role)
    role?: Role;
}
