import { Controller, Get, Query, ParseIntPipe, Post, Body } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ApiTags, ApiOperation, ApiQuery, ApiBody } from '@nestjs/swagger';
import { Public } from '../auth/guard/auth.guard';
import { PaymentMethodEnum, PaymentStatusEnum } from '@prisma/client';

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
    return this.paymentService.getCustomPeriodStatistics(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Post('momo')
  @Public()
  @ApiOperation({ summary: 'Tạo thanh toán MoMo và trả về payUrl' })
  @ApiBody({
    schema: {
      properties: {
        amount: { type: 'number' },
        orderId: { type: 'string' },
        orderInfo: { type: 'string' },
        appointmentId: { type: 'number' },
      },
    },
  })
  async createMomoPayment(
    @Body('amount') amount: number,
    @Body('orderId') orderId: string,
    @Body('orderInfo') orderInfo: string,
    @Body('appointmentId') appointmentId: number, 
  ) {
    // Validate số tiền
    if (typeof amount !== 'number' || amount < 1000 || amount > 50000000) {
      return {
        success: false,
        message:
          'Số tiền phải từ 1.000 đến 50.000.000 VND theo quy định của MoMo.',
      };
    }

    try {
      // ✅ Bước 1: Lưu thông tin thanh toán với trạng thái PENDING
      await this.paymentService.create({
        appointmentId: Number(orderId),
        price: Number(amount),
        paymentMethod: PaymentMethodEnum.MOMO,
        paymentStatus: PaymentStatusEnum.PENDING,
      });

      // ✅ Bước 2: Tạo yêu cầu thanh toán MoMo
      const result = await this.paymentService.createMomoPayment(
        amount,
        orderId,
        orderInfo,
      );
      console.log('PaymentController - MoMo result:', result);

      if (result?.payUrl) {
        return { success: true, payUrl: result.payUrl };
      }

      console.error('Không lấy được payUrl từ MoMo:', result);
      return {
        success: false,
        message: result.message || 'Không lấy được đường dẫn thanh toán',
        ...result,
      };
    } catch (error) {
      const message =
        error?.message ||
        error?.response?.data?.message ||
        'Lỗi không xác định';
      console.error('Lỗi khi tạo thanh toán:', message);
      return { success: false, message };
    }
  }
}
