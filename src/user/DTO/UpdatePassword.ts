import {ApiProperty} from '@nestjs/swagger';
import {IsString, MinLength, MaxLength} from 'class-validator';

export class UpdatePasswordDto {
    @ApiProperty({
        example: 'currentPassword123',
        description: 'Mật khẩu hiện tại của người dùng',
    })
    @IsString()
    @MinLength(6)
    @MaxLength(20)
    currentPassword: string;

    @ApiProperty({
        example: 'newPassword123',
        description: 'Mật khẩu mới của người dùng',
    })
    @IsString()
    @MinLength(6)
    @MaxLength(20)
    newPassword: string;
}