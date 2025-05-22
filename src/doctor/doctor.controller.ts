import {
    BadRequestException, ParseIntPipe, Body, Controller, Delete,
    Get, Param, Post, Put, Query, UploadedFile, UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiQuery, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CertificationService } from './service/certification.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import {
    CreateCertification, UpdateCertification, CreateDoctor, UpdateDoctor,
    CreateAchievement, UpdateAchievement, CreateSpecialty, UpdateSpecialty,
    CreateDoctorSchedule, UpdateDoctorSchedule
} from './DTO';
import { DoctorService } from './service/doctor.service';
import { ConfigService } from '@nestjs/config';
import { AchievementService } from './service/achievement.service';
import { SpecialtyService } from './service/specialty.service';
import { DoctorScheduleService } from './service/doctorSchedule.service';

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
        private readonly doctorScheduleService: DoctorScheduleService
    ) { }

    // ---------------- Doctor CRUD ----------------
    @ApiOperation({ summary: 'Create a new doctor' })
    @Post()
    createDoctor(@Body() createDoctorDto: CreateDoctor) {
        return this.doctorService.createDoctor(createDoctorDto);
    }

    @ApiOperation({ summary: 'Get all doctors with pagination' })
    @Get()
    getAllDoctors(
        @Query('page', ParseIntPipe) page = 1,
        @Query('limit', ParseIntPipe) limit = 10,
    ) {
        return this.doctorService.getAllDoctors(page, limit);
    }

    @ApiOperation({ summary: 'Get a doctor by ID' })
    @Get(':id')
    getDoctorById(@Param('id', ParseIntPipe) id: number) {
        return this.doctorService.getDoctorById(id);
    }

    @ApiOperation({ summary: 'Update a doctor by ID' })
    @Put(':id')
    updateDoctor(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDoctorDto: UpdateDoctor,
    ) {
        return this.doctorService.updateDoctor(id, updateDoctorDto);
    }

    // ------------- Certification CRUD ------------
    @ApiOperation({ summary: 'Upload a certification for a doctor (PDF/JPG/PNG)' })
    @Post('/certification')
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
    async createCertification(
        @UploadedFile() file: Express.Multer.File,
        @Body('doctorId', ParseIntPipe) doctorId: number,
    ) {
        const MAX_SIZE_MB = parseInt(this.configService.get<string>('MAX_FILE_SIZE') || '10');
        const fileSizeInMB = file.size / (1024 * 1024);
        if (fileSizeInMB > MAX_SIZE_MB) {
            throw new BadRequestException(`File size must not exceed ${MAX_SIZE_MB}MB`);
        }

        const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException(`Unsupported file type: ${file.mimetype}`);
        }

        const uploadResult = await this.cloudinaryService.uploadFile(file, {
            context: `doctorId=${doctorId}`,
            public_id: `${Date.now()}_${file.originalname.split('.')[0]}`,
        });

        return this.certificationService.create({
            doctorId,
            fileUrl: uploadResult.secure_url,
        });
    }

    @ApiOperation({ summary: 'Get all certifications (paginated)' })
    @Get('/certification')
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'limit', required: false, example: 10 })
    async findAllCertifications(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        const pageNumber = page ? parseInt(page) : 1;
        const limitNumber = limit ? parseInt(limit) : 10;
        return this.certificationService.findAll(pageNumber, limitNumber);
    }

    @ApiOperation({ summary: 'Get certification by ID' })
    @Get('/certification/:id')
    async findCertification(@Param('id', ParseIntPipe) id: number) {
        return this.certificationService.findOne(id);
    }

    @ApiOperation({ summary: 'Update a certification by ID' })
    @Put('/certification/:id')
    async updateCertification(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateCertification,
    ) {
        return this.certificationService.update(id, dto);
    }

    @ApiOperation({ summary: 'Delete a certification by ID' })
    @Delete('/certification/:id')
    async removeCertification(@Param('id', ParseIntPipe) id: number) {
        return this.certificationService.remove(id);
    }

    // -------------- Achievement CRUD -------------
    @ApiOperation({ summary: 'Create a new doctor achievement' })
    @Post('/achievement')
    createAchievement(@Body() dto: CreateAchievement) {
        return this.achievementService.create(dto);
    }

    @ApiOperation({ summary: 'Get all achievements (paginated)' })
    @Get('/achievement')
    findAllAchievements(
        @Query('page', ParseIntPipe) page = 1,
        @Query('limit', ParseIntPipe) limit = 10,
    ) {
        return this.achievementService.findAll(page, limit);
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

    // --------------- Specialty CRUD --------------
    @ApiOperation({ summary: 'Create a new specialty' })
    @Post('/specialty')
    createSpecialty(@Body() createSpecialtyDto: CreateSpecialty) {
        return this.specialtyService.create(createSpecialtyDto);
    }

    @ApiOperation({ summary: 'Get all specialties (paginated)' })
    @Get('/specialty')
    findAllSpecialties(
        @Query('page', ParseIntPipe) page = 1,
        @Query('limit', ParseIntPipe) limit = 10,
    ) {
        return this.specialtyService.findAll(page, limit);
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
        @Body() updateSpecialtyDto: UpdateSpecialty,
    ) {
        return this.specialtyService.update(id, updateSpecialtyDto);
    }

    @ApiOperation({ summary: 'Delete a specialty by ID' })
    @Delete('/specialty/:id')
    removeSpecialty(@Param('id', ParseIntPipe) id: number) {
        return this.specialtyService.remove(id);
    }

    // ----------- Doctor Schedule CRUD ------------
    @ApiOperation({ summary: 'Create a new doctor schedule' })
    @Post('/doctorSchedule')
    createDoctorSchedule(@Body() createDoctorScheduleDto: CreateDoctorSchedule) {
        return this.doctorScheduleService.create(createDoctorScheduleDto);
    }

    @ApiOperation({ summary: 'Get all doctor schedules (paginated)' })
    @Get('/doctorSchedule')
    findAllDoctorSchedules(
        @Query('page', ParseIntPipe) page = 1,
        @Query('limit', ParseIntPipe) limit = 10,
    ) {
        return this.doctorScheduleService.findAll(page, limit);
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
        @Body() updateDoctorScheduleDto: UpdateDoctorSchedule,
    ) {
        return this.doctorScheduleService.update(id, updateDoctorScheduleDto);
    }

    @ApiOperation({ summary: 'Delete a doctor schedule by ID' })
    @Delete('/doctorSchedule/:id')
    removeDoctorSchedule(@Param('id', ParseIntPipe) id: number) {
        return this.doctorScheduleService.remove(id);
    }
}