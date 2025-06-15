import {
  Controller, Get, Post, Body, Param, Delete, Patch, Query, ParseIntPipe,
  NotFoundException,
  Put,
  DefaultValuePipe,
} from '@nestjs/common';
import { HospitalService } from './services/hospital.service';
import { CreateHospital, UpdateHospital } from './DTO';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { ReviewHospitalService } from './services/reviewHospital.service';
import { RoleEnum } from 'prisma/generated/mongodb';
import { Hospital } from '@prisma/client';
import { Public } from 'src/auth/guard/auth.guard';
import { AchievementHospitalService } from './services/achievement.hospital.service';
import { UpdateAchievement } from 'src/doctor/DTO';
import { DashboardHospitalService } from './services/dashboard.service';
import { HospitalFilterDto } from './DTO/HospitalFilter.dto';

@ApiTags('Hospital')
@Controller('hospital')
export class HospitalController {
  constructor(
    private readonly hospitalService: HospitalService,
    private readonly reviewService: ReviewHospitalService,
    private readonly achievementService: AchievementHospitalService,
    private readonly dashboardService: DashboardHospitalService
  ) { }

  //HOSPITAL=================================================================
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
    return this.hospitalService.createHospital(data)
  }

  @Get('/hospitals')
  async getAllHospitals(
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,) {
    return this.hospitalService.getAllHospitals()
  }

  @Get(':id')
  async getHospital(@Param('id', ParseIntPipe) id: number) {
    return this.hospitalService.getHospitalById(id)
  }

  @Put(':id')
  async updateHospital(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateHospital) {
    return this.hospitalService.updateHospital(id, data)
  }

  @Delete(':id')
  async deleteHospital(@Param('id', ParseIntPipe) id: number) {
    return this.hospitalService.deleteHospital(id)
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

  @Post('review/:reviewId/reply')
  async replyToReview(
    @Param('hospitalId', ParseIntPipe) hospitalId: number,
    @Param('reviewId') reviewId: string,
    @Body()
    body: {
      comment: string;
      rating: number;
      userId: number;
      role: RoleEnum;
    },
  ) {
    const reply = await this.reviewService.replyToReview(reviewId, {
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
}
