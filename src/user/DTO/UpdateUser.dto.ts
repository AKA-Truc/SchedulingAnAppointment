import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RoleEnum, GenderEmun } from '@prisma/client';

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
    phone?: number;

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
        example: GenderEmun.Male,
        enum: GenderEmun,
        description: 'Giới tính người dùng',
    })
    @IsEnum(GenderEmun)
    gender: GenderEmun;

    @ApiPropertyOptional({
        example: RoleEnum.ADMIN,
        enum: RoleEnum,
        description: 'Vai trò mới của người dùng',
    })
    @IsOptional()
    @IsEnum(RoleEnum)
    role?: RoleEnum;
}
