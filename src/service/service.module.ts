import { Module } from "@nestjs/common";
import { ServicesController } from "./service.controller";
import { ServicesService } from "./service.service";
import { PrismaService } from "src/prisma/prisma.service";

@Module({
    controllers: [ServicesController],
    providers: [ServicesService, PrismaService]
})
export class ServicesModule { }