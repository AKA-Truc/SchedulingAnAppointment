import { Controller, Get, Post, Put, Delete, Param, Body, Query, ParseIntPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './DTO';
import { ApiQuery } from '@nestjs/swagger';
import { Public } from 'src/auth/guard/auth.guard';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post()
    @Public()
    async createUser(@Body() createUserDto: CreateUserDto) {
        return this.userService.createUser(createUserDto);
    }

    @Get()
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'limit', required: false, example: 10 })
    async getAllUsers(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        // parseInt với fallback
        const pageNumber = page ? parseInt(page) : 1;
        const limitNumber = limit ? parseInt(limit) : 10;
        return this.userService.getAllUsers(pageNumber, limitNumber);
    }

    @Get(':id')
    async getUserById(@Param('id', ParseIntPipe) id: number) {
        return this.userService.getUserById(id);
    }

    @Put(':id')
    async updateUser(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateUserDto: UpdateUserDto,
    ) {
        return this.userService.updateUser(id, updateUserDto);
    }

    @Delete(':id')
    async deleteUser(@Param('id', ParseIntPipe) id: number) {
        return this.userService.deleteUser(id);
    }
}
