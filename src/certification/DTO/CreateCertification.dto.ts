import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl, IsInt, Min } from 'class-validator';

export class CreateCertification {
    @ApiProperty({ example: 'https://your-cdn.com/uploads/cert1.pdf' })
    @IsString()
    @IsUrl()
    fileUrl: string;

    @ApiProperty({ example: 1 })
    @IsInt()
    @Min(1)
    doctorId: number;
}
