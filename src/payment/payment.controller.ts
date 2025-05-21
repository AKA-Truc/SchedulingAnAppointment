import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) {}

    @Get('statistics/monthly')
    @ApiOperation({ summary: 'Get monthly payment statistics' })
    @ApiQuery({ name: 'year', required: true, type: Number })
    @ApiQuery({ name: 'month', required: true, type: Number })
    async getMonthlyStatistics(
        @Query('year', ParseIntPipe) year: number,
        @Query('month', ParseIntPipe) month: number,
    ) {
        return this.paymentService.getMonthlyStatistics(year, month);
    }

    @Get('statistics/quarterly')
    @ApiOperation({ summary: 'Get quarterly payment statistics' })
    @ApiQuery({ name: 'year', required: true, type: Number })
    @ApiQuery({ name: 'quarter', required: true, type: Number })
    async getQuarterlyStatistics(
        @Query('year', ParseIntPipe) year: number,
        @Query('quarter', ParseIntPipe) quarter: number,
    ) {
        return this.paymentService.getQuarterlyStatistics(year, quarter);
    }

    @Get('statistics/yearly')
    @ApiOperation({ summary: 'Get yearly payment statistics' })
    @ApiQuery({ name: 'year', required: true, type: Number })
    async getYearlyStatistics(@Query('year', ParseIntPipe) year: number) {
        return this.paymentService.getYearlyStatistics(year);
    }

    @Get('statistics/custom')
    @ApiOperation({ summary: 'Get payment statistics for a custom date range' })
    @ApiQuery({ name: 'startDate', required: true, type: String })
    @ApiQuery({ name: 'endDate', required: true, type: String })
    async getCustomPeriodStatistics(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
    ) {
        return this.paymentService.getCustomPeriodStatistics(new Date(startDate), new Date(endDate));
    }
}
