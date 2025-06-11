import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginUserDto {
    @ApiProperty({
        example: "admin@gmail.com",
        description: "ID người dùng đăng nhập"
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: "adminadmin",
        description: "Password người dùng đăng nhập"
    })
    @IsString()
    @MinLength(8)
    password: string;
}