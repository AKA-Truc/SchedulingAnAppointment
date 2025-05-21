import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RoleEnum, GenderEnum } from '@prisma/client';

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
        description: 'email mới',
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

    // @ApiPropertyOptional({
    //     example: 'NewPass123',
    //     description: 'Mật khẩu mới, ít nhất 8 ký tự',
    //     minLength: 8,
    // })
    // @IsOptional()
    // @IsString()
    // @MinLength(8)
    // password?: String;

    @ApiPropertyOptional({
        example: GenderEnum.Male,
        enum: GenderEnum,
        description: 'Giới tính người dùng',
    })
    @IsEnum(GenderEnum)
    gender: GenderEnum;

    @ApiPropertyOptional({
        example: RoleEnum.ADMIN,
        enum: RoleEnum,
        description: 'Vai trò mới của người dùng',
    })
    @IsOptional()
    @IsEnum(RoleEnum)
    role?: RoleEnum;
}
