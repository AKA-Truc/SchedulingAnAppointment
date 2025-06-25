import { Controller, Get, Post, Put, Delete, Param, Body, Query, ParseIntPipe, UseInterceptors, UploadedFile, ParseFilePipeBuilder, FileValidator, FileTypeValidator, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './DTO';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Public } from 'src/auth/guard/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { use } from 'passport';

@Controller('users')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly configService: ConfigService,
        private readonly cloudinaryService: CloudinaryService,
    ) { }

    @ApiOperation({ summary: 'Get count of user' })
    @Get('count')
    @Public()
    async getUserCount() {
        return this.userService.getUserCount();
    }

    @Post()
    @Public()
    async createUser(@Body() createUserDto: CreateUserDto) {
        return this.userService.createUser(createUserDto);
    }

    @Post('/avatar/:userId')
    @UseInterceptors(FileInterceptor('file'))
    async uploadAvatar(
        @UploadedFile(
            new ParseFilePipeBuilder()
                .addFileTypeValidator({
                    fileType: /\/(jpg|jpeg|png|webp)$/i,
                })
                .build(),
        )
        file: Express.Multer.File,
        @Param('userId', ParseIntPipe) userId: number,
    ) {
        const MAX_SIZE_MB = parseInt(this.configService.get<string>('MAX_FILE_SIZE') || '10');
        const sizeInMB = file.size / (1024 * 1024);

        if (sizeInMB > MAX_SIZE_MB) {
            throw new BadRequestException(`File size must not exceed ${MAX_SIZE_MB}MB`);
        }

        const allowedMimeTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/webp'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException(`Unsupported file type: ${file.mimetype}`);
        }

        const result = await this.cloudinaryService.uploadFile(file, {
            context: `userId=${userId}`,
            public_id: `${Date.now()}_${file.originalname.split('.')[0]}`,
        });

        return this.userService.uploadAvatar(userId, result.secure_url);
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
