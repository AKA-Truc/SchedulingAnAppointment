import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class LogoutDto {
    @ApiProperty({
        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzQ4Njc2MTc0LCJleHAiOjE3NDg2NzcwNzR9.jEnDIAlgx4XK-B95OtYkXuxAdh8uixDRZWjQfcyka6A",
        description: "accessToken"
    })
    @IsNotEmpty()
    accessToken: string;

    @ApiProperty({
        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzQ4Njc2MTc0LCJleHAiOjE3NDg2NzcwNzR9.jEnDIAlgx4XK-B95OtYkXuxAdh8uixDRZWjQfcyka6A",
        description: "refreshToken"
    })
    @IsNotEmpty()
    refreshToken: string
}