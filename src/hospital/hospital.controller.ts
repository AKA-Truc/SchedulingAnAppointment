import {
    Controller, Get, Post, Body, Param,Delete,Patch,Query,ParseIntPipe,
} from '@nestjs/common';
import { HospitalService } from './hospital.service';
import { CreateHospital, UpdateHospital } from './DTO';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { ReviewHospitalService } from './reviewHospital.service';
import { RoleEnum } from 'prisma/generated/mongodb';

@ApiTags('Hospital')
@Controller('hospital')
export class HospitalController {
  constructor(
    private readonly hospitalService: HospitalService,
    private readonly reviewService: ReviewHospitalService,
  ) {}

    @Post()
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

    @Get()
    async getHospitalReviews(@Param('hospitalId', ParseIntPipe) hospitalId: number) {
      const reviews = await this.reviewService.getHospitalReviews(hospitalId);

      return {
        message: 'Reviews fetched successfully',
        data: reviews,
      };
    }

    @Post(':reviewId/reply')
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

    @Post(':reviewId/flag')
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

    @Delete(':reviewId')
    async deleteReview(@Param('reviewId') reviewId: string) {
      const deleted = await this.reviewService.deleteReview(reviewId);
      return {
        message: 'Review deleted',
        data: deleted,
      };
    }

}
