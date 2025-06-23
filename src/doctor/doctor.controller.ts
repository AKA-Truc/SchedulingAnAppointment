import {
    BadRequestException, Body, Controller, DefaultValuePipe, Delete, Get,
    Param, ParseIntPipe, Post, Put, Query, Req, UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiQuery, ApiOperation, ApiTags } from '@nestjs/swagger';

import {
    CreateCertification, UpdateCertification, CreateDoctor, UpdateDoctor,
    CreateAchievement, UpdateAchievement, CreateSpecialty, UpdateSpecialty,
    CreateDoctorSchedule, UpdateDoctorSchedule,
} from './DTO';

import { DoctorService } from './service/doctor.service';
import { AchievementService } from './service/achievement.service';
import { SpecialtyService } from './service/specialty.service';
import { DoctorScheduleService } from './service/doctorSchedule.service';
import { CertificationService } from './service/certification.service';


import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ConfigService } from '@nestjs/config';

@ApiTags('Doctor')
@Controller('doctor')
export class DoctorController {
    constructor(
        private readonly doctorService: DoctorService,
        private readonly cloudinaryService: CloudinaryService,
        private readonly certificationService: CertificationService,
        private readonly configService: ConfigService,
        private readonly achievementService: AchievementService,
        private readonly specialtyService: SpecialtyService,
        private readonly doctorScheduleService: DoctorScheduleService,
    ) { }

    @ApiOperation({ summary: 'Get top 3 rated doctors' })
    @Get('/top-rated')
    getTopRatedDoctors() {
        return this.doctorService.getTopRatedDoctors();
    }

    @ApiOperation({ summary: 'Get all doctors with pagination' })
    @Get()
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'limit', required: false, example: 10 })
    getAllDoctors(
        @Query('page', ParseIntPipe) page = 1,
        @Query('limit', ParseIntPipe) limit = 10,
    ) {
        return this.achievementService.findAll(page, limit);
    }

    // ──────── Doctor CRUD ────────
    @ApiOperation({ summary: 'Create a new doctor' })
    @Post()
    createDoctor(@Body() dto: CreateDoctor) {
        return this.doctorService.createDoctor(dto);
    }

    @Get('/by-specialty/:specialtyId')
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'limit', required: false, example: 10 })
    getAllDoctorsbySpecialty(
        @Param('specialtyId', ParseIntPipe) specialtyId: number,
        @Query('page', ParseIntPipe) page = 1,
        @Query('limit', ParseIntPipe) limit = 10,
    ) {
        return this.doctorService.getDoctors({ specialtyId, page, limit });
    }

    @ApiOperation({ summary: 'Get all certifications (paginated)' })
    @Get('/certification')
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'limit', required: false, example: 10 })
    findAllCertifications(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.certificationService.findAll(
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 10,
        );
    }

    @ApiOperation({ summary: 'Get all doctor schedules (paginated)' })
    @Get('/doctorSchedule')
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'limit', required: false, example: 2 })
    findAllDoctorSchedules(
        @Query('page', ParseIntPipe) page = 1,
        @Query('limit', ParseIntPipe) limit = 2,
    ) {
        return this.doctorScheduleService.findAll(page, limit);
    }

    @ApiOperation({ summary: 'Get all specialties (paginated)' })
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'limit', required: false, example: 30 })
    @Get('/specialty/get-all')
    findAllSpecialties(
        @Query('page', ParseIntPipe) page = 1,
        @Query('limit', ParseIntPipe) limit = 30,
    ) {
        return this.specialtyService.findAll(page, limit);
    }

    @ApiOperation({ summary: 'Get all specialties (paginated)' })
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'limit', required: false, example: 6 })
    @Get('/specialty/:hospitalId')
    findAllSpecialtiesByHospitalId(
        @Param('hospitalId', ParseIntPipe) hospitalId: number,
        @Query('page', ParseIntPipe) page = 1,
        @Query('limit', ParseIntPipe) limit = 6,
    ) {
        return this.specialtyService.getSpecialtiesByHospitalId(hospitalId, page, limit);
    }

    @ApiOperation({ summary: 'Get all achievements (paginated)' })
    @Get('/achievement')
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'limit', required: false, example: 10 })
    findAllAchievements(
        @Query('page', ParseIntPipe) page = 1,
        @Query('limit', ParseIntPipe) limit = 10,
    ) {
        return this.achievementService.findAll(page, limit);
    }

    // ──────── Doctor CRUD ────────
    @ApiOperation({ summary: 'Get a doctor by userId' })
    @Get('/user/:id')
    getDoctorByUserId(@Param('id', ParseIntPipe) id: number) {
        return this.doctorService.getDoctorByUserId(id);
    }

    @ApiOperation({ summary: 'Create a new doctor' })
    @Post()
    createDoctor(@Body() dto: CreateDoctor) {
        return this.doctorService.createDoctor(dto);
    }

    @ApiOperation({ summary: 'Get a doctor by ID' })
    @Get(':id')
    getDoctorById(@Param('id', ParseIntPipe) id: number) {
        return this.doctorService.getDoctorById(id);
    }

    @ApiOperation({ summary: 'Get performance of Doctor Now (1 month)' })
    @Get('perfomance/:id')
    getPerformanceOfDoctor(@Param(':id', ParseIntPipe) id: number) {
        return this.doctorService.getDoctorPerformanceCurrentMonth(id);
    }

    @ApiOperation({ summary: 'Filter' })
    @Get('/filter/doctor')
    @ApiQuery({ name: 'specialty', required: false })
    @ApiQuery({ name: 'minRating', required: false })
    @ApiQuery({ name: 'hospital', required: false })
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'limit', required: false, example: 10 })
    filterDoctors(
        @Query('specialty') specialtyId?: number,
        @Query('minRating') minRating?: number,
        @Query('hospital') hospitalId?: number,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.doctorService.filterDoctors({ specialtyId, minRating, hospitalId, page, limit });
    }

    @ApiOperation({ summary: 'Update a doctor by ID' })
    @Put(':id')
    updateDoctor(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateDoctor,
    ) {
        return this.doctorService.updateDoctor(id, dto);
    }

    // ──────── Certification CRUD ────────
    @ApiOperation({ summary: 'Upload a certification for a doctor (PDF/JPG/PNG)' })
    @Post('/certification')
    @UseInterceptors(FileInterceptor('file', {
        limits: { fileSize: 10 * 1024 * 1024 }, // giới hạn 10MB
    }))
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
    async createCertification(
        @UploadedFile() file: Express.Multer.File,
        @Body('doctorId', ParseIntPipe) doctorId: number,
    ) {
        // In log đầu vào ngay khi nhận request
        console.log('Received doctorId:', doctorId);
        console.log('Received file info:', {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
        });

        // Kiểm tra kích thước file
        const MAX_SIZE_MB = parseInt(this.configService.get<string>('MAX_FILE_SIZE') || '10');
        const sizeInMB = file.size / (1024 * 1024);
        if (sizeInMB > MAX_SIZE_MB) {
            throw new BadRequestException(`File size must not exceed ${MAX_SIZE_MB}MB`);
        }

        // Kiểm tra định dạng file
        const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException(`Unsupported file type: ${file.mimetype}`);
        }

        // Upload lên cloudinary (giả sử service bạn đã có sẵn)
        const result = await this.cloudinaryService.uploadFile(file, {
            context: `doctorId=${doctorId}`,
            public_id: `${Date.now()}_${file.originalname.split('.')[0]}`,
        });

        // Tạo bản ghi chứng chỉ trong DB
        return this.certificationService.create({
            doctorId,
            fileUrl: result.secure_url,
        });
    }


    @ApiOperation({ summary: 'Get certification by ID' })
    @Get('/certification/:id')
    findCertification(@Param('id', ParseIntPipe) id: number) {
        return this.certificationService.findOne(id);
    }

    @ApiOperation({ summary: 'Update a certification by ID' })
    @Put('/certification/:id')
    updateCertification(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateCertification,
    ) {
        return this.certificationService.update(id, dto);
    }

    @ApiOperation({ summary: 'Delete a certification by ID' })
    @Delete('/certification/:id')
    removeCertification(@Param('id', ParseIntPipe) id: number) {
        return this.certificationService.remove(id);
    }

    // ──────── Achievement CRUD ────────
    @ApiOperation({ summary: 'Create a new doctor achievement' })
    @Post('/achievement')
    createAchievement(@Body() dto: CreateAchievement) {
        return this.achievementService.create(dto);
    }

    @ApiOperation({ summary: 'Get achievement by ID' })
    @Get('/achievement/:id')
    findAchievement(@Param('id', ParseIntPipe) id: number) {
        return this.achievementService.findOne(id);
    }

    @ApiOperation({ summary: 'Update an achievement by ID' })
    @Put('/achievement/:id')
    updateAchievement(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateAchievement,
    ) {
        return this.achievementService.update(id, dto);
    }

    @ApiOperation({ summary: 'Delete an achievement by ID' })
    @Delete('/achievement/:id')
    removeAchievement(@Param('id', ParseIntPipe) id: number) {
        return this.achievementService.remove(id);
    }

    // ──────── Specialty CRUD ────────
    @ApiOperation({ summary: 'Create a new specialty' })
    @Post('/specialty')
    createSpecialty(@Body() dto: CreateSpecialty) {
        return this.specialtyService.create(dto);
    }

    @ApiOperation({ summary: 'Get specialty by ID' })
    @Get('/specialty/:id')
    findSpecialty(@Param('id', ParseIntPipe) id: number) {
        return this.specialtyService.findOne(id);
    }

    @ApiOperation({ summary: 'Update a specialty by ID' })
    @Put('/specialty/:id')
    updateSpecialty(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateSpecialty,
    ) {
        return this.specialtyService.update(id, dto);
    }

    @ApiOperation({ summary: 'Delete a specialty by ID' })
    @Delete('/specialty/:id')
    removeSpecialty(@Param('id', ParseIntPipe) id: number) {
        return this.specialtyService.remove(id);
    }

    // ──────── Doctor Schedule CRUD ────────
    @ApiOperation({ summary: 'Create a new doctor schedule' })
    @Post('/doctorSchedule')
    createDoctorSchedule(@Body() dto: CreateDoctorSchedule) {
        return this.doctorScheduleService.create(dto);
    }

    @ApiOperation({ summary: 'Get doctor schedule by ID' })
    @Get('/doctorSchedule/:id')
    findDoctorSchedule(@Param('id', ParseIntPipe) id: number) {
        return this.doctorScheduleService.findOne(id);
    }

    @ApiOperation({ summary: 'Update a doctor schedule by ID' })
    @Put('/doctorSchedule/:id')
    updateDoctorSchedule(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateDoctorSchedule,
    ) {
        return this.doctorScheduleService.update(id, dto);
    }

    @ApiOperation({ summary: 'Delete a doctor schedule by ID' })
    @Delete('/doctorSchedule/:id')
    removeDoctorSchedule(@Param('id', ParseIntPipe) id: number) {
        return this.doctorScheduleService.remove(id);
    }
}
