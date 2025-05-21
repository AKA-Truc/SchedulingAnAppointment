import { Controller, Get, Post, Put, Delete, Param, Body, Query, ParseIntPipe, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { CertificationService } from './certification.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateCertification, UpdateCertification } from './DTO';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';

@Controller('certifications')
export class CertificationController {
    constructor(
        private readonly certificationService: CertificationService,
        private readonly cloudinaryService: CloudinaryService,
    ) { }

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                doctorId: { type: 'number', example: 1 },
                file: { type: 'string', format: 'binary' },
            },
            required: ['doctorId', 'file'],
        },
    })
    async create(
        @UploadedFile() file: Express.Multer.File,
        @Body('doctorId', ParseIntPipe) doctorId: number,
    ) {
        // 1. Validate size (Giới hạn 10MB)
        const MAX_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE || '10');
        const fileSizeInMB = file.size / (1024 * 1024);
        if (fileSizeInMB > MAX_SIZE_MB) {
            throw new BadRequestException(`File size must not exceed ${MAX_SIZE_MB}MB`);
        }

        // 2. Validate định dạng (PDF, PNG, JPG...)
        const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException(`Unsupported file type: ${file.mimetype}`);
        }

        // 3. Upload lên Cloudinary + đính metadata nếu muốn
        const uploadResult = await this.cloudinaryService.uploadFile(file, {
            context: `doctorId=${doctorId}`, // gắn metadata
            public_id: `${Date.now()}_${file.originalname.split('.')[0]}`, // optional: tên file
        });

        // 4. Lưu vào DB
        return this.certificationService.create({
            doctorId,
            fileUrl: uploadResult.secure_url,
        });
    }



    @Get()
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'limit', required: false, example: 10 })
    async findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        const pageNumber = page ? parseInt(page) : 1;
        const limitNumber = limit ? parseInt(limit) : 10;
        return this.certificationService.findAll(pageNumber, limitNumber);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.certificationService.findOne(id);
    }

    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateCertification,
    ) {
        return this.certificationService.update(id, dto);
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.certificationService.remove(id);
    }
}
