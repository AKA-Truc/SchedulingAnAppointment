import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoleEnum, GenderEnum } from '@prisma/client';
import { Type } from 'class-transformer';

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
