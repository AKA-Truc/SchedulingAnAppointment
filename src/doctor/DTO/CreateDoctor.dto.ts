import { IsInt, IsNotEmpty, IsOptional, IsString, IsNumber, IsUrl, Min, Max, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUserDto } from 'src/user/DTO';
import { Type } from 'class-transformer';

export class CreateDoctor {
    @ApiProperty({
        description: 'Thông tin người dùng sẽ được tạo và liên kết với bác sĩ',
        type: CreateUserDto,
    })
    @ValidateNested()
    @Type(() => CreateUserDto)
    @IsNotEmpty()
    user: CreateUserDto;

    @ApiProperty({
        example: 2,
        description: 'ID chuyên khoa của bác sĩ',
    })
    @IsInt()
    @IsNotEmpty()
    specialtyId: number;

    @ApiProperty({
        example: 3,
        description: 'ID bệnh viện mà bác sĩ làm việc',
    })
    @IsInt()
    @IsNotEmpty()
    hospitalId: number;
}
