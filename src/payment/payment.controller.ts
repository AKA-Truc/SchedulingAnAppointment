import { Controller, Get, Query, ParseIntPipe, Post, Body, Req, Param, BadRequestException } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ApiTags, ApiOperation, ApiQuery, ApiBody } from '@nestjs/swagger';
import { Public } from '../auth/guard/auth.guard';
import { PaymentMethodEnum, PaymentStatusEnum } from '@prisma/client';
import { Request } from 'express';

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
    @Body('paymentMethod') paymentMethod: PaymentMethodEnum,
    @Body('paymentStatus') paymentStatus: PaymentStatusEnum,
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
        appointmentId: appointmentId, // SỬA: lấy đúng trường từ body
        price: Number(amount),
        paymentMethod: paymentMethod ?? PaymentMethodEnum.MOMO,
        paymentStatus: paymentStatus ?? PaymentStatusEnum.PENDING,
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

  @Post('vnpay')
  @Public()
  @ApiOperation({ summary: 'Tạo thanh toán VNPay và trả về paymentUrl' })
  @ApiBody({
    schema: {
      properties: {
        amount: { type: 'number' },
        orderId: { type: 'string' },
        orderInfo: { type: 'string' },
        appointmentId: { type: 'number' },
        paymentMethod: { type: 'string' },
        paymentStatus: { type: 'string' },
      },
    },
  })
  async createVnpayPayment(@Body() createVnpayPaymentDto: any, @Req() req: Request) {
    console.log('\n🚀🚀🚀 [VNPay Controller] === NEW PAYMENT REQUEST ===');
    console.log('🚀 [VNPay Controller] Request Body:', JSON.stringify(createVnpayPaymentDto, null, 2));
    console.log('🚀 [VNPay Controller] Request Headers:', JSON.stringify(req.headers, null, 2));
    console.log('🚀 [VNPay Controller] Request IP:', req.ip || req.connection.remoteAddress);
    
    try {
      const { appointmentId, amount, orderId, orderInfo } = createVnpayPaymentDto;
      
      console.log('\n📝 [VNPay Controller] === VALIDATING INPUT ===');
      console.log('📝 appointmentId:', appointmentId, '(type:', typeof appointmentId, ')');
      console.log('📝 amount:', amount, '(type:', typeof amount, ')');
      console.log('📝 orderId:', orderId, '(type:', typeof orderId, ')');
      console.log('📝 orderInfo:', orderInfo, '(type:', typeof orderInfo, ')');
      
      if (!appointmentId || !amount || !orderId || !orderInfo) {
        console.error('❌ [VNPay Controller] Missing required fields:', { appointmentId, amount, orderId, orderInfo });
        throw new BadRequestException('Missing required payment information');
      }

      console.log('\n💰 [VNPay Controller] === PAYMENT DETAILS ===');
      console.log('💰 Processing payment for appointment:', appointmentId);
      console.log('💰 Amount (VND):', amount);
      console.log('💰 Amount (Cents for VNPay):', amount * 100);
      console.log('💰 Order ID:', orderId);
      console.log('💰 Order Info:', orderInfo);

      // Get client IP
      const ipAddr = req.ip || req.connection.remoteAddress || '127.0.0.1';
      console.log('🌍 [VNPay Controller] Client IP for VNPay:', ipAddr);

      console.log('\n🔧 [VNPay Controller] === CALLING VNPAY SERVICE ===');
      console.log('🔧 Service Input Parameters:');
      console.log('  - amount:', amount);
      console.log('  - orderId:', orderId);
      console.log('  - orderInfo:', orderInfo);
      console.log('  - ipAddr:', ipAddr);

      // Create VNPay payment using official method
      const vnpayResponse = await this.paymentService.createVnpayPayment(
        amount,
        orderId,
        orderInfo,
        ipAddr
      );

      console.log('\n✅ [VNPay Controller] === SERVICE RESPONSE ===');
      console.log('✅ VNPay service response:', JSON.stringify(vnpayResponse, null, 2));

      // Save payment record
      const paymentData = {
        appointmentId,
        price: amount, // Fix: use 'price' instead of 'amount'
        paymentMethod: PaymentMethodEnum.VNPAY,
        paymentStatus: PaymentStatusEnum.PENDING,
      };

      console.log('\n💾 [VNPay Controller] === SAVING PAYMENT RECORD ===');
      console.log('💾 Payment data to save:', JSON.stringify(paymentData, null, 2));
      
      const paymentResult = await this.paymentService.create(paymentData);
      console.log('💾 Payment record saved successfully:', JSON.stringify(paymentResult, null, 2));

      const response = {
        success: true,
        paymentUrl: vnpayResponse.paymentUrl,
        orderId: vnpayResponse.orderId,
        amount: vnpayResponse.amount,
        paymentId: paymentResult.payment.paymentId,
        signature: vnpayResponse.signature,
      };

      console.log('\n📤 [VNPay Controller] === FINAL RESPONSE ===');
      console.log('📤 Sending response to frontend:', JSON.stringify(response, null, 2));
      console.log('📤 Payment URL length:', response.paymentUrl.length);
      console.log('📤 Payment URL preview:', response.paymentUrl.substring(0, 100) + '...');
      console.log('🚀🚀🚀 [VNPay Controller] === END PAYMENT REQUEST ===\n');
      
      return response;
    } catch (error) {
      console.error('\n💥💥💥 [VNPay Controller] === PAYMENT ERROR ===');
      console.error('💥 Error type:', error.constructor.name);
      console.error('💥 Error message:', error.message);
      console.error('💥 Error stack:', error.stack);
      console.error('💥 Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      console.error('💥💥💥 [VNPay Controller] === END ERROR ===\n');
      
      throw new BadRequestException(`Payment creation failed: ${error.message}`);
    }
  }

  @Get('vnpay/ipn')
  @Public()
  @ApiOperation({ summary: 'VNPay IPN callback' })
  async vnpayIpn(@Query() query: any) {
    console.log('🔔 [VNPay IPN] Received IPN callback:', query);
    
    try {
      // Clone query object để avoid mutating original
      const vnpParams = { ...query };
      const isValidSignature = this.paymentService.verifyVnpaySignature(vnpParams);
      
      if (isValidSignature) {
        const orderId = query['vnp_TxnRef'];
        const responseCode = query['vnp_ResponseCode'];
        const amount = parseInt(query['vnp_Amount']) / 100; // Convert from VND cents to VND
        const transactionNo = query['vnp_TransactionNo'];
        const bankCode = query['vnp_BankCode'];
        const payDate = query['vnp_PayDate'];

        console.log('✅ [VNPay IPN] Valid signature - Payment details:', { 
          orderId, responseCode, amount, transactionNo, bankCode, payDate 
        });

        // Extract appointmentId from orderId (format: VNP_{appointmentId}_{timestamp})
        const appointmentIdMatch = orderId.match(/VNP_(\d+)_/);
        if (appointmentIdMatch) {
          const appointmentId = parseInt(appointmentIdMatch[1]);
          console.log('🎯 [VNPay IPN] Extracted appointmentId:', appointmentId);

          try {
            // Find payment record by appointmentId
            const existingPayments = await this.paymentService.findAll(1, 100);
            const paymentRecord = existingPayments.data.find(p => 
              p.appointmentId === appointmentId && 
              p.paymentMethod === 'VNPAY' &&
              p.paymentStatus === 'PENDING'
            );

            if (paymentRecord) {
              // Update payment status based on responseCode
              if (responseCode === '00') {
                await this.paymentService.updateStatus(paymentRecord.paymentId, 'PAID');
                console.log('💰 [VNPay IPN] Payment marked as PAID for appointment:', appointmentId);
              } else {
                await this.paymentService.updateStatus(paymentRecord.paymentId, 'UNPAID');
                console.log('❌ [VNPay IPN] Payment marked as UNPAID for appointment:', appointmentId);
              }
            } else {
              console.log('⚠️ [VNPay IPN] No matching payment record found for appointment:', appointmentId);
            }
          } catch (updateError) {
            console.error('💥 [VNPay IPN] Error updating payment status:', updateError);
          }
        }

        return { RspCode: '00', Message: 'success' };
      } else {
        console.error('❌ [VNPay IPN] Invalid signature');
        return { RspCode: '97', Message: 'Fail checksum' };
      }
    } catch (error) {
      console.error('💥 [VNPay IPN] Processing error:', error);
      return { RspCode: '99', Message: 'Unknown error' };
    }
  }

  @Get('vnpay/return')
  @Public()
  @ApiOperation({ summary: 'VNPay return URL' })
  async vnpayReturn(@Query() query: any) {
    try {
      const isValidSignature = this.paymentService.verifyVnpaySignature(query);
      
      if (isValidSignature) {
        const responseCode = query['vnp_ResponseCode'];
        const orderId = query['vnp_TxnRef'];
        
        if (responseCode === '00') {
          // Thanh toán thành công
          return {
            success: true,
            message: 'Thanh toán thành công',
            responseCode,
            orderId
          };
        } else {
          // Thanh toán thất bại
          return {
            success: false,
            message: 'Thanh toán thất bại',
            responseCode,
            orderId
          };
        }
      } else {
        return {
          success: false,
          message: 'Chữ ký không hợp lệ',
          responseCode: '97'
        };
      }
    } catch (error) {
      console.error('VNPay return error:', error);
      return {
        success: false,
        message: 'Lỗi xử lý kết quả thanh toán',
        responseCode: '99'
      };
    }
  }

  @Get('admin/list')
  @ApiOperation({ summary: 'Lấy danh sách tất cả payments cho admin' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: PaymentStatusEnum })
  @ApiQuery({ name: 'method', required: false, enum: PaymentMethodEnum })
  async getPaymentsForAdmin(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: PaymentStatusEnum,
    @Query('method') method?: PaymentMethodEnum,
  ) {
    try {
      const result = await this.paymentService.findAllForAdmin({
        page: Number(page),
        limit: Number(limit),
        status,
        method,
      });
      return {
        message: 'Lấy danh sách payments thành công',
        code: 200,
        data: result,
      };
    } catch (error) {
      return {
        message: error?.message || 'Lỗi khi lấy danh sách payments',
        code: 500,
        data: null,
      };
    }
  }

  @Get('admin/:id')
  @ApiOperation({ summary: 'Lấy chi tiết payment theo ID cho admin' })
  async getPaymentByIdForAdmin(@Param('id', ParseIntPipe) id: number) {
    try {
      const payment = await this.paymentService.findByIdForAdmin(id);
      return {
        message: 'Lấy chi tiết payment thành công',
        code: 200,
        data: payment,
      };
    } catch (error) {
      return {
        message: error?.message || 'Không tìm thấy payment',
        code: 404,
        data: null,
      };
    }
  }

  @Post('admin/:id/update-status')
  @ApiOperation({ summary: 'Cập nhật trạng thái payment cho admin' })
  @ApiBody({
    schema: {
      properties: {
        paymentStatus: { 
          type: 'string',
          enum: ['PAID', 'UNPAID', 'PENDING'],
        },
      },
    },
  })
  async updatePaymentStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('paymentStatus') paymentStatus: PaymentStatusEnum,
  ) {
    try {
      const updatedPayment = await this.paymentService.updateStatus(id, paymentStatus);
      return {
        message: 'Cập nhật trạng thái payment thành công',
        code: 200,
        data: updatedPayment,
      };
    } catch (error) {
      return {
        message: error?.message || 'Lỗi khi cập nhật trạng thái payment',
        code: 500,
        data: null,
      };
    }
  }
}
