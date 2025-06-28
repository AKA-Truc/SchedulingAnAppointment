import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from "@nestjs/common";
import { ServicesService } from "./service.service";
import { CreateServiceDto } from "./dto/CreateService.dto";
import { ApiQuery } from "@nestjs/swagger";
import { Public } from "src/auth/guard/auth.guard";
import { Roles } from "src/auth/guard/roles.guard";

@Controller('services')
export class ServicesController {
    constructor(private readonly service: ServicesService) { }

    @Roles('ADMIN')
    @Post()
    create(@Body() dto: CreateServiceDto) {
        return this.service.create(dto);
    }

    @Roles('ADMIN', 'DOCTOR', 'USER')
    @Public()
    @Get()
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'limit', required: false, example: 10 })
    getAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        const pageNumber = page ? parseInt(page) : 1;
        const limitNumber = limit ? parseInt(limit) : 10;
        return this.service.getAll(pageNumber, limitNumber);
    }

    @Roles('ADMIN', 'DOCTOR', 'USER')
    @Public()
    @Get(':id')
    getService(@Param('id', ParseIntPipe) id: number) {
        return this.service.findById(id);
    }


    @Roles('ADMIN')
    @Put(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() data: CreateServiceDto) {
        return this.service.update(id, data);
    }

    @Roles('ADMIN')
    @Delete(':id')
    delete(@Param('id', ParseIntPipe) id: number) {
        return this.service.delete(id);
    }

}