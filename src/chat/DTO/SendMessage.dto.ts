import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class SendMessageDto {

    @ApiProperty({ description: "Người gửi", example: 1 })
    @IsNumber()
    fromUserId: number;

    @ApiProperty({ description: "Người Nhận", example: 2 })
    @IsNumber()
    toUserId: number;

    @ApiProperty({ description: "Message", example: "Hello" })
    @IsString()
    @IsNotEmpty()
    content: string;
}