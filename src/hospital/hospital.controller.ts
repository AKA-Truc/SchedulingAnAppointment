import {
  Controller, Get, Post, Body, Param, Delete, Patch, Query, ParseIntPipe,
  NotFoundException,
  Put,
  DefaultValuePipe,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor, AnyFilesInterceptor } from '@nestjs/platform-express';
import { HospitalService } from './services/hospital.service';
import { CreateHospital, UpdateHospital } from './DTO';
import { ApiTags, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ReviewHospitalService } from './services/reviewHospital.service';
import { RoleEnum } from 'prisma/generated/mongodb';
import { Hospital } from '@prisma/client';
import { Public } from 'src/auth/guard/auth.guard';
import { AchievementHospitalService } from './services/achievement.hospital.service';
import { UpdateAchievement } from 'src/doctor/DTO';
import { DashboardHospitalService } from './services/dashboard.service';
import { HospitalFilterDto } from './DTO/HospitalFilter.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@ApiTags('Hospital')
@Controller('hospital')
export class HospitalController {
  constructor(
    private readonly hospitalService: HospitalService,
    private readonly reviewService: ReviewHospitalService,
    private readonly achievementService: AchievementHospitalService,
    private readonly dashboardService: DashboardHospitalService,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  //HOSPITAL=================================================================
  @Public()
  @Get('statistics')
  async getHospitalStats() {
    const stats = await this.hospitalService.getHospitalStatistics();

    return {
      message: 'Hospital statistics retrieved successfully',
      code: 200,
      data: stats,
    };
  }
  
  @Public()
  @Get('search/:searchString')
  async searchHospitals(
    @Param('searchString') searchString: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ): Promise<Hospital[]> {
    const numericSkip = skip ? parseInt(skip, 10) : 0;
    const numericTake = take ? parseInt(take, 10) : 10;

    const results = await this.hospitalService.searchHospital({
      skip: numericSkip,
      take: numericTake,
      where: {
        OR: [
          { name: { contains: searchString, mode: 'insensitive' } },
          { address: { contains: searchString, mode: 'insensitive' } },
          { phone: { contains: searchString, mode: 'insensitive' } },
          { email: { contains: searchString, mode: 'insensitive' } },
          { type: { contains: searchString, mode: 'insensitive' } },
        ],
      },
    });

    if (!results.length) {
      throw new NotFoundException('Không tìm thấy bệnh viện phù hợp.');
    }

    return results;
  }

  @Public()
  @Get('filter')
  async getFilteredHospitals(
    @Query() filterDto: HospitalFilterDto,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ): Promise<Hospital[]> {
    const numericSkip = skip ? parseInt(skip, 10) : 0;
    const numericTake = take ? parseInt(take, 10) : 10;
    return this.hospitalService.filterHospital(filterDto, numericSkip, numericTake);
  }


  @Post()
  async createHospital(@Body() data: CreateHospital) {
    try {
      console.log('🏥 Creating hospital with data:', data);
      const hospital = await this.hospitalService.createHospital(data);
      console.log('✅ Hospital created:', hospital);
      
      return {
        message: 'Hospital created successfully',
        code: 201,
        data: hospital,
      };
    } catch (error) {
      console.error('❌ Error creating hospital:', error);
      throw error;
    }
  }

  @Public()
  @Get('/hospitals')
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, example: 'Chợ Rẫy' })
  @ApiQuery({ name: 'type', required: false, example: 'Bệnh viện công' })
  @ApiQuery({ name: 'location', required: false, example: 'Quận 5' })
  @ApiQuery({ name: 'specialty', required: false, example: 'Tim mạch' })
  @ApiQuery({ name: 'latitude', required: false, example: 10.7542 })
  @ApiQuery({ name: 'longitude', required: false, example: 106.6621 })
  @ApiQuery({ name: 'radius', required: false, example: 10 })
  async getAllHospitals(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('location') location?: string,
    @Query('specialty') specialty?: string,
    @Query('latitude') latitude?: string,
    @Query('longitude') longitude?: string,
    @Query('radius') radius?: string,
  ) {
    const filters = {
      search,
      type,
      location,
      specialty,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      radius: radius ? parseFloat(radius) : undefined,
    };

    const result = await this.hospitalService.getAllHospitals(page, limit, filters);

    return {
      message: 'Hospitals retrieved successfully',
      code: 200,
      data: result.data,
      meta: result.meta,
    };
  }

  @Public()
  @Get(':id')
  async getHospital(@Param('id', ParseIntPipe) id: number) {
    const hospital = await this.hospitalService.getHospitalById(id);

    return {
      message: 'Hospital retrieved successfully',
      code: 200,
      data: hospital,
    };
  }

  @Put(':id')
  async updateHospital(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateHospital) {
    return this.hospitalService.updateHospital(id, data)
  }

  @Delete(':id')
  async deleteHospital(@Param('id', ParseIntPipe) id: number) {
    await this.hospitalService.deleteHospital(id);

    return {
      message: 'Hospital deleted successfully',
      code: 200,
    };
  }

  // New endpoints for frontend requirements
  @Public()
  @Get('search-by-location')
  @ApiQuery({ name: 'latitude', required: true, example: 10.7542 })
  @ApiQuery({ name: 'longitude', required: true, example: 106.6621 })
  @ApiQuery({ name: 'radius', required: true, example: 10 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  async searchHospitalsByLocation(
    @Query('latitude', ParseIntPipe) latitude: number,
    @Query('longitude', ParseIntPipe) longitude: number,
    @Query('radius', ParseIntPipe) radius: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    const hospitals = await this.hospitalService.searchByLocation(latitude, longitude, radius, limit);

    return {
      message: 'Hospitals found by location',
      code: 200,
      data: hospitals,
    };
  }

  @Public()
  @Get('by-specialty/:specialtyId')
  async getHospitalsBySpecialty(
    @Param('specialtyId', ParseIntPipe) specialtyId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const result = await this.hospitalService.getHospitalsBySpecialty(specialtyId, page, limit);

    return {
      message: 'Hospitals by specialty retrieved successfully',
      code: 200,
      data: result.data,
      meta: result.meta,
    };
  }

  @Public()
  @Get('nearby')
  @ApiQuery({ name: 'latitude', required: true, example: 10.7542 })
  @ApiQuery({ name: 'longitude', required: true, example: 106.6621 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  async getNearbyHospitals(
    @Query('latitude', ParseIntPipe) latitude: number,
    @Query('longitude', ParseIntPipe) longitude: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const hospitals = await this.hospitalService.getNearbyHospitals(latitude, longitude, limit);

    return {
      message: 'Nearby hospitals retrieved successfully',
      code: 200,
      data: hospitals,
    };
  }

  @Public()
  @Get('featured')
  async getFeaturedHospitals(
    @Query('limit', new DefaultValuePipe(6), ParseIntPipe) limit: number,
  ) {
    const hospitals = await this.hospitalService.getFeaturedHospitals(limit);

    return {
      message: 'Featured hospitals retrieved successfully',
      code: 200,
      data: hospitals,
    };
  }


  @Patch(':id/coordinates')
  async updateHospitalCoordinates(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { latitude: number; longitude: number },
  ) {
    const hospital = await this.hospitalService.updateCoordinates(id, body.latitude, body.longitude);

    return {
      message: 'Hospital coordinates updated successfully',
      code: 200,
      data: hospital,
    };
  }

  // Image Upload Endpoints
  @Post(':id/upload-logo')
  @UseInterceptors(FileInterceptor('logo'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Hospital logo image',
    schema: {
      type: 'object',
      properties: {
        logo: {
          type: 'string',
          format: 'binary',
          description: 'Logo image file (JPG, PNG, WEBP)',
        },
      },
    },
  })
  async uploadHospitalLogo(
    @Param('id', ParseIntPipe) hospitalId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new NotFoundException('No file uploaded');
    }

    const uploadResult = await this.cloudinaryService.uploadHospitalLogo(file, hospitalId);

    // Update hospital logo URL in database
    const hospital = await this.hospitalService.updateHospital(hospitalId, {
      logo: uploadResult.secure_url,
    });

    return {
      message: 'Hospital logo uploaded successfully',
      code: 200,
      data: {
        logoUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        hospital,
      },
    };
  }

  @Post(':id/upload-gallery')
  @UseInterceptors(FilesInterceptor('images', 5))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Hospital gallery images (max 5)',
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Gallery images (JPG, PNG, WEBP)',
        },
        imageType: {
          type: 'string',
          enum: ['exterior', 'interior', 'facility', 'equipment'],
          description: 'Type of gallery images',
        },
      },
    },
  })
  async uploadHospitalGallery(
    @Param('id', ParseIntPipe) hospitalId: number,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('imageType') imageType: 'exterior' | 'interior' | 'facility' | 'equipment' = 'facility',
  ) {
    if (!files || files.length === 0) {
      throw new NotFoundException('No files uploaded');
    }

    const uploadPromises = files.map(file =>
      this.cloudinaryService.uploadHospitalGallery(file, hospitalId, imageType)
    );

    const uploadResults = await Promise.all(uploadPromises);

    // Update hospital gallery URLs in database (you might want to create a separate gallery table)
    const galleryUrls = uploadResults.map(result => result.secure_url);
    await this.hospitalService.addGalleryImages(hospitalId, galleryUrls);

    return {
      message: 'Hospital gallery images uploaded successfully',
      code: 200,
      data: {
        images: uploadResults.map(result => ({
          url: result.secure_url,
          publicId: result.public_id,
        })),
      },
    };
  }

  @Post(':id/upload-certificate')
  @UseInterceptors(FileInterceptor('certificate'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Hospital certificate/achievement image',
    schema: {
      type: 'object',
      properties: {
        certificate: {
          type: 'string',
          format: 'binary',
          description: 'Certificate image file',
        },
        title: {
          type: 'string',
          description: 'Certificate title',
        },
        description: {
          type: 'string',
          description: 'Certificate description',
        },
      },
    },
  })
  async uploadHospitalCertificate(
    @Param('id', ParseIntPipe) hospitalId: number,
    @UploadedFile() file: Express.Multer.File,
    @Body('title') title: string,
    @Body('description') description?: string,
  ) {
    if (!file) {
      throw new NotFoundException('No file uploaded');
    }

    const uploadResult = await this.cloudinaryService.uploadHospitalCertificate(file, hospitalId);

    // Create certificate record in database
    const certificate = await this.hospitalService.addCertificate(hospitalId, {
      title,
      description,
      imageUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    });

    return {
      message: 'Hospital certificate uploaded successfully',
      code: 200,
      data: certificate,
    };
  }

  @Public()
  @Get(':id/images')
  async getHospitalImages(@Param('id', ParseIntPipe) hospitalId: number) {
    const images = await this.cloudinaryService.getHospitalImages(hospitalId);

    return {
      message: 'Hospital images retrieved successfully',
      code: 200,
      data: images,
    };
  }

  @Delete(':id/images/:publicId')
  async deleteHospitalImage(
    @Param('id', ParseIntPipe) hospitalId: number,
    @Param('publicId') publicId: string,
  ) {
    await this.cloudinaryService.deleteImage(publicId);

    return {
      message: 'Hospital image deleted successfully',
      code: 200,
    };
  }

  // REVIEW HOSPITAL ====================================================
  @Post('review')
  async createReview(
    @Param('hospitalId', ParseIntPipe) hospitalId: number,
    @Body()
    body: {
      comment: string;
      rating: number;
      userId: number;
      role: RoleEnum;
    },
  ) {
    const review = await this.reviewService.createReview({
      ...body,
      hospitalId,
    });

    return {
      message: 'Review created successfully',
      data: review,
    };
  }

  @Get('review')
  async getHospitalReviews(@Param('hospitalId', ParseIntPipe) hospitalId: number) {
    const reviews = await this.reviewService.getHospitalReviews(hospitalId);

    return {
      message: 'Reviews fetched successfully',
      data: reviews,
    };
  }

  @Post('review/:parentReviewId/reply')
  async replyToReview(
    @Param('hospitalId', ParseIntPipe) hospitalId: number,
    @Param('parentReviewId') parentReviewId: string,
    @Body()
    body: {
      comment: string;
      rating: number;
      userId: number;
      role: RoleEnum;
    },
  ) {
    const reply = await this.reviewService.replyToReview(parentReviewId, {
      ...body,
      hospitalId,
    });

    return {
      message: 'Reply added successfully',
      data: reply,
    };
  }

  @Post('review/:reviewId/flag')
  async flagReview(
    @Param('reviewId') reviewId: string,
    @Body() body: { reason: string },
  ) {
    const result = await this.reviewService.flagReview(reviewId, body.reason);
    return {
      message: 'Review flagged',
      data: result,
    };
  }

  @Delete('review/:reviewId')
  async deleteReview(@Param('reviewId') reviewId: string) {
    const deleted = await this.reviewService.deleteReview(reviewId);
    return {
      message: 'Review deleted',
      data: deleted,
    };
  }

  // ACHIEVEMENT HOSPITAL ==============================================

  @Public()
  @Get('achievement/search/:searchString')
  async searchAchievementHospital(
    @Param('searchString') searchString: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,) {

    const numericSkip = skip ? parseInt(skip, 10) : 0;
    const numericTake = take ? parseInt(take, 10) : 10;

    const results = await this.achievementService.search({
      skip: numericSkip,
      take: numericTake,
      where: {
        OR: [
          { title: { contains: searchString, mode: 'insensitive' } },
          { description: { contains: searchString, mode: 'insensitive' } },
        ],
      },
    });

    if (!results.length) {
      throw new NotFoundException('Không tìm thấy thành tựu phù hợp.');
    }

    return results;
  }

  @Put(':hospitalId/achievements/:achievementId')
  async updateAchievementOfHospital(
    @Param('hospitalId') hospitalId: string,
    @Param('achievementId') achievementId: string,
    @Body() dto: UpdateAchievement,
  ) {
    const numericHospitalId = parseInt(hospitalId, 10);
    const numericAchievementId = parseInt(achievementId, 10);

    return this.achievementService.updateAchievementOfHospital(
      numericHospitalId,
      numericAchievementId,
      dto,
    );
  }

  @Delete(':hospitalId/achievements/:achievementId')
  async removeAchievementOfHospital(
    @Param('hospitalId') hospitalId: string,
    @Param('achievementId') achievementId: string,
  ) {
    const numericHospitalId = parseInt(hospitalId, 10);
    const numericAchievementId = parseInt(achievementId, 10);

    return this.achievementService.removeAchievementOfHospital(
      numericHospitalId,
      numericAchievementId,
    );
  }


  @Get(':hospitalId/achievement/search')
  async searchAchievements(
    @Param('hospitalId', ParseIntPipe) hospitalId: number,
    @Query('keyword') keyword = '',
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.achievementService.searchAchievementsOfHospital(
      hospitalId,
      keyword,
      parseInt(page),
      parseInt(limit),
    );
  }

  @Get(':hospitalId/achievement')
  async getAchievementsOfHospital(
    @Param('hospitalId', ParseIntPipe) hospitalId: number,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.achievementService.getAchievementsOfHospital(
      hospitalId,
      parseInt(page),
      parseInt(limit),
    );
  }


  //DASHBOARD======================================================
  @Get(':hospitalId/appointment-report/count-in-month')
  async countAppointmentsInMonth(
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
    @Param('hospitalId', ParseIntPipe) hospitalId: number
  ) {
    return this.dashboardService.countAppointmentsInMonth(month, year, hospitalId)
  }

  @Get(':hospitalId/appointment-report/count-by-status')
  async countAppointmentByStatus(
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
    @Param('hospitalId', ParseIntPipe) hospitalId: number
  ) {
    return this.dashboardService.countAppointmentByStatus(month, year, hospitalId)
  }

  @Get(':hospitalId/appointment-report/daily')
  async dailyAppointmentsInMonth(
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
    @Param('hospitalId', ParseIntPipe) hospitalId: number
  ) {
    return this.dashboardService.dailyAppointmentsInMonth(month, year, hospitalId)
  }

  @Get(':hospitalId/appointment-report/top-doctors')
  async topDoctorByAppointment(
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
    @Param('hospitalId', ParseIntPipe) hospitalId: number,
  ) {
    return this.dashboardService.topDoctorByAppointment(limit, hospitalId);
  }

  @Get(':hospitalId/revenue-report/total-in-month')
  async totalRevenueInMonth(
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
    @Param('hospitalId', ParseIntPipe) hospitalId: number,
  ) {
    return this.dashboardService.totalRevenueInMonth(month, year, hospitalId);
  }

  @Get(':hospitalId/revenue-report/by-day')
  async revenueByDayInMonth(
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
    @Param('hospitalId', ParseIntPipe) hospitalId: number,
  ) {
    return this.dashboardService.revenueByDayInMonth(month, year, hospitalId);
  }

  @Get(':hospitalId/revenue-report/by-day')
  async revenueByDoctor(
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
    @Param('hospitalId', ParseIntPipe) hospitalId: number,
  ) {
    return this.dashboardService.revenueByDoctor(month, year, hospitalId);
  }

  @Get(':hospitalId/feedback-report/average-rating')
  async averageRatingInMonth(
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
    @Param('hospitalId', ParseIntPipe) hospitalId: number,
  ) {
    return this.dashboardService.averageRatingInMonth(month, year, hospitalId);
  }

  @Get('feedback-report/count-in-month')
  async countFeedbackInMonth(
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
  ) {
    return this.dashboardService.countFeedbackInMonth(month, year);
  }

  @Get('feedback-report/average-rating')
  async topDoctorsByRating(@Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,) {
    return this.dashboardService.topDoctorsByRating(limit);
  }

  // ============= New Combined Endpoints =============
  
  @Post('create-with-media')
  @UseInterceptors(AnyFilesInterceptor())
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Create hospital with logo and gallery images',
    schema: {
      type: 'object',
      properties: {
        // Hospital data fields
        name: { type: 'string', description: 'Hospital name' },
        address: { type: 'string', description: 'Hospital address' },
        phone: { type: 'string', description: 'Hospital phone' },
        description: { type: 'string', description: 'Hospital description' },
        email: { type: 'string', description: 'Hospital email' },
        establishYear: { type: 'number', description: 'Establishment year' },
        workScheduling: { type: 'string', description: 'Work schedule' },
        type: { type: 'string', description: 'Hospital type' },
        website: { type: 'string', description: 'Hospital website' },
        latitude: { type: 'number', description: 'Latitude coordinate' },
        longitude: { type: 'number', description: 'Longitude coordinate' },
        
        // File upload fields
        logoFile: { type: 'string', format: 'binary', description: 'Logo image file' },
        galleryFiles: { 
          type: 'array', 
          items: { type: 'string', format: 'binary' },
          description: 'Gallery image files' 
        },
        imageType: {
          type: 'string',
          enum: ['exterior', 'interior', 'facility', 'equipment'],
          description: 'Type of gallery images',
        },
      },
    },
  })
  async createHospitalWithMedia(
    @Body() hospitalData: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    try {
      console.log('Received files:', files?.map(f => ({ fieldname: f.fieldname, filename: f.originalname })));
      console.log('Received hospitalData:', hospitalData);
      
      // Clean and parse hospital data from FormData
      const cleanHospitalData = {
        name: hospitalData.name,
        address: hospitalData.address,
        phone: hospitalData.phone,
        description: hospitalData.description,
        email: hospitalData.email,
        establishYear: parseInt(hospitalData.establishYear) || new Date().getFullYear(),
        type: hospitalData.type,
        logo: hospitalData.logo || '',
        workScheduling: hospitalData.workScheduling,
        website: hospitalData.website || undefined,
        latitude: hospitalData.latitude ? parseFloat(hospitalData.latitude) : undefined,
        longitude: hospitalData.longitude ? parseFloat(hospitalData.longitude) : undefined,
      };
      
      console.log('Cleaned hospital data:', cleanHospitalData);
      
      // Separate logo and gallery files
      const logoFile = files?.find(file => file.fieldname === 'logoFile');
      const galleryFiles = files?.filter(file => file.fieldname === 'galleryFiles') || [];

      let logoUrl: string | undefined;
      let galleryUrls: string[] = [];

      // Upload logo if provided
      if (logoFile) {
        const logoUploadResult = await this.cloudinaryService.uploadHospitalLogo(logoFile, 0); // temporary ID
        logoUrl = logoUploadResult.secure_url;
      }

      // Upload gallery images if provided
      if (galleryFiles.length > 0) {
        const galleryUploadPromises = galleryFiles.map(file => 
          this.cloudinaryService.uploadHospitalGallery(file, 0, hospitalData.imageType || 'facility')
        );
        const galleryUploadResults = await Promise.all(galleryUploadPromises);
        galleryUrls = galleryUploadResults.map(result => result.secure_url);
      }

      // Create hospital with media URLs
      const hospital = await this.hospitalService.createHospitalWithMedia(
        cleanHospitalData,
        logoUrl,
        galleryUrls
      );

      return {
        message: 'Hospital created successfully with media',
        code: 201,
        data: hospital,
      };
    } catch (error) {
      return {
        message: 'Failed to create hospital with media',
        code: 500,
        error: error.message,
      };
    }
  }

  @Put(':id/update-with-media')
  @UseInterceptors(AnyFilesInterceptor())
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Update hospital with new logo and gallery images',
    schema: {
      type: 'object',
      properties: {
        // Hospital data fields (all optional for update)
        name: { type: 'string', description: 'Hospital name' },
        address: { type: 'string', description: 'Hospital address' },
        phone: { type: 'string', description: 'Hospital phone' },
        description: { type: 'string', description: 'Hospital description' },
        email: { type: 'string', description: 'Hospital email' },
        establishYear: { type: 'number', description: 'Establishment year' },
        workScheduling: { type: 'string', description: 'Work schedule' },
        type: { type: 'string', description: 'Hospital type' },
        website: { type: 'string', description: 'Hospital website' },
        latitude: { type: 'number', description: 'Latitude coordinate' },
        longitude: { type: 'number', description: 'Longitude coordinate' },
        
        // File upload fields
        logoFile: { type: 'string', format: 'binary', description: 'New logo image file' },
        galleryFiles: { 
          type: 'array', 
          items: { type: 'string', format: 'binary' },
          description: 'New gallery image files'
        },
        imageType: {
          type: 'string',
          enum: ['exterior', 'interior', 'facility', 'equipment'],
          description: 'Type of gallery images',
        },
      },
    },
  })
  async updateHospitalWithMedia(
    @Param('id', ParseIntPipe) hospitalId: number,
    @Body() hospitalData: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    try {
      console.log('Update - Received files:', files?.map(f => ({ fieldname: f.fieldname, filename: f.originalname })));
      console.log('Update - Received hospitalData:', hospitalData);
      
      // Clean and parse hospital data from FormData
      const cleanHospitalData: any = {};
      
      if (hospitalData.name) cleanHospitalData.name = hospitalData.name;
      if (hospitalData.address) cleanHospitalData.address = hospitalData.address;
      if (hospitalData.phone) cleanHospitalData.phone = hospitalData.phone;
      if (hospitalData.description) cleanHospitalData.description = hospitalData.description;
      if (hospitalData.email) cleanHospitalData.email = hospitalData.email;
      if (hospitalData.establishYear) cleanHospitalData.establishYear = parseInt(hospitalData.establishYear);
      if (hospitalData.type) cleanHospitalData.type = hospitalData.type;
      if (hospitalData.logo) cleanHospitalData.logo = hospitalData.logo;
      if (hospitalData.workScheduling) cleanHospitalData.workScheduling = hospitalData.workScheduling;
      if (hospitalData.website) cleanHospitalData.website = hospitalData.website;
      if (hospitalData.latitude) cleanHospitalData.latitude = parseFloat(hospitalData.latitude);
      if (hospitalData.longitude) cleanHospitalData.longitude = parseFloat(hospitalData.longitude);
      
      console.log('Update - Cleaned hospital data:', cleanHospitalData);
      
      // Separate logo and gallery files
      const logoFile = files?.find(file => file.fieldname === 'logoFile');
      const galleryFiles = files?.filter(file => file.fieldname === 'galleryFiles') || [];

      let logoUrl: string | undefined;
      let galleryUrls: string[] = [];

      // Upload new logo if provided
      if (logoFile) {
        const logoUploadResult = await this.cloudinaryService.uploadHospitalLogo(logoFile, hospitalId);
        logoUrl = logoUploadResult.secure_url;
      }

      // Upload new gallery images if provided
      if (galleryFiles.length > 0) {
        const galleryUploadPromises = galleryFiles.map(file => 
          this.cloudinaryService.uploadHospitalGallery(file, hospitalId, hospitalData.imageType || 'facility')
        );
        const galleryUploadResults = await Promise.all(galleryUploadPromises);
        galleryUrls = galleryUploadResults.map(result => result.secure_url);
      }

      // Update hospital with new media URLs
      const hospital = await this.hospitalService.updateHospitalWithMedia(
        hospitalId,
        cleanHospitalData,
        logoUrl,
        galleryUrls
      );

      return {
        message: 'Hospital updated successfully with media',
        code: 200,
        data: hospital,
      };
    } catch (error) {
      return {
        message: 'Failed to update hospital with media',
        code: 500,
        error: error.message,
      };
    }
  }
}
