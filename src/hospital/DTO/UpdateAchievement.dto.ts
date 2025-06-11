import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class UpdateAchievementHospital {
    @ApiProperty({ example: 'Bệnh viện đạt chuẩn quốc tế' })
    @IsString()
    title: string;

    @ApiProperty({ example: 'Bệnh viện đạt chuẩn quốc tế được tổ chức .... chứng nhận với thành tựu ....' })
    @IsString()
    description: string;

    @ApiProperty({ example: '2024-12-15' })
    dateAchieved: Date;
}