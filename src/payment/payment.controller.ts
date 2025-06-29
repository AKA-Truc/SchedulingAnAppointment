import { Controller, Get, Query, ParseIntPipe, Post, Body, Req, Param, BadRequestException, Res } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ApiTags, ApiOperation, ApiQuery, ApiBody } from '@nestjs/swagger';
import { Public } from '../auth/guard/auth.guard';
import { PaymentMethodEnum, PaymentStatusEnum } from '@prisma/client';
import { Request } from 'express';
import { AppointmentService } from '../appointment/service/appointment.service';

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly appointmentService: AppointmentService,
  ) {}

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
  async vnpayIpn(@Query() query: any, @Res() res: any) {
    console.log('🔔 [VNPay IPN] Received IPN callback:', query);
    
    try {
      // Clone query object để avoid mutating original
      const vnpParams = { ...query };
      const isValidSignature = this.paymentService.verifyVnpaySignature(vnpParams);
      
      if (!isValidSignature) {
        console.error('❌ [VNPay IPN] Invalid signature');
        return res.status(200).json({ RspCode: '97', Message: 'Fail checksum' });
      }

      const orderId = query['vnp_TxnRef'];
      const responseCode = query['vnp_ResponseCode'];
      const transactionStatus = query['vnp_TransactionStatus'];
      const amount = parseInt(query['vnp_Amount']) / 100; // Convert from VND cents to VND
      const transactionNo = query['vnp_TransactionNo'];
      const bankCode = query['vnp_BankCode'];
      const payDate = query['vnp_PayDate'];

      console.log('✅ [VNPay IPN] Valid signature - Payment details:', { 
        orderId, responseCode, transactionStatus, amount, transactionNo, bankCode, payDate 
      });

      // Extract appointmentId from orderId (format: VNP_{appointmentId}_{timestamp})
      const appointmentIdMatch = orderId.match(/VNP_(\d+)_/);
      if (!appointmentIdMatch) {
        console.error('❌ [VNPay IPN] Invalid orderId format:', orderId);
        return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
      }

      const appointmentId = parseInt(appointmentIdMatch[1]);
      console.log('🎯 [VNPay IPN] Extracted appointmentId:', appointmentId);

      try {
        // ✅ Find payment record more efficiently by appointmentId and method
        const paymentRecord = await this.paymentService.findPaymentByAppointmentAndMethod(appointmentId, PaymentMethodEnum.VNPAY);
        console.log('🔍 [VNPay IPN] Found payment record:', paymentRecord ? 'YES' : 'NO');

        if (!paymentRecord) {
          console.log('⚠️ [VNPay IPN] No payment record found for appointment:', appointmentId);
          return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
        }

        // Check if payment already processed
        if (paymentRecord.paymentStatus !== 'PENDING') {
          console.log('⚠️ [VNPay IPN] Payment already processed. Current status:', paymentRecord.paymentStatus);
          return res.status(200).json({ RspCode: '02', Message: 'This order has been updated to the payment status' });
        }

        // Verify amount matches
        if (Math.abs(paymentRecord.price - amount) > 1) { // Allow 1 VND tolerance for rounding
          console.error('❌ [VNPay IPN] Amount mismatch. Expected:', paymentRecord.price, 'Got:', amount);
          return res.status(200).json({ RspCode: '04', Message: 'Amount invalid' });
        }

        // Update payment status based on responseCode and transactionStatus
        if (responseCode === '00' && transactionStatus === '00') {
          // ✅ Payment successful
          await this.paymentService.updateStatus(paymentRecord.paymentId, 'PAID');
          console.log('💰 [VNPay IPN] Payment marked as PAID for appointment:', appointmentId);
          
          // ✅ Update appointment status to SCHEDULED
          try {
            await this.appointmentService.updateStatus(appointmentId, 'SCHEDULED');
            console.log('📅 [VNPay IPN] Appointment status updated to SCHEDULED for appointment:', appointmentId);
          } catch (appointmentError) {
            console.error('💥 [VNPay IPN] Error updating appointment status:', appointmentError);
            // Still return success for payment update, appointment update failure is separate
          }

          return res.status(200).json({ RspCode: '00', Message: 'Success' });
        } else {
          // ❌ Payment failed
          await this.paymentService.updateStatus(paymentRecord.paymentId, 'UNPAID');
          console.log('❌ [VNPay IPN] Payment marked as UNPAID for appointment:', appointmentId, 'Response code:', responseCode);
          
          return res.status(200).json({ RspCode: '00', Message: 'Success' });
        }
      } catch (updateError) {
        console.error('💥 [VNPay IPN] Error updating payment status:', updateError);
        return res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
      }
    } catch (error) {
      console.error('💥 [VNPay IPN] Processing error:', error);
      return res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
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
      // ✅ Update payment status
      const updatedPayment = await this.paymentService.updateStatus(id, paymentStatus);
      
      // ✅ If payment is marked as PAID, also update appointment status to SCHEDULED
      if (paymentStatus === 'PAID' && updatedPayment.appointmentId) {
        try {
          await this.appointmentService.updateStatus(updatedPayment.appointmentId, 'SCHEDULED');
          console.log('📅 [Admin] Appointment status updated to SCHEDULED for appointment:', updatedPayment.appointmentId);
        } catch (appointmentError) {
          console.error('💥 [Admin] Error updating appointment status:', appointmentError);
        }
      }
      
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

  @Post('vnpay/manual-update')
  @Public()
  @ApiOperation({ summary: 'Manual update VNPay payment status from return URL' })
  async vnpayManualUpdate(@Body() body: any) {
    console.log('🔄 [VNPay Manual Update] Received request:', body);
    
    try {
      const { appointmentId, vnp_TxnRef, vnp_ResponseCode, vnp_Amount, vnp_TransactionNo, vnp_BankCode, vnp_PayDate } = body;

      if (!appointmentId || !vnp_TxnRef || !vnp_ResponseCode) {
        return {
          success: false,
          message: 'Missing required parameters',
        };
      }

      console.log('🎯 [VNPay Manual Update] Processing for appointment:', appointmentId);

      try {
        // ✅ Find payment record more efficiently by appointmentId and method
        const paymentRecord = await this.paymentService.findPaymentByAppointmentAndMethod(appointmentId, PaymentMethodEnum.VNPAY);
        console.log('🔍 [VNPay Manual Update] Found payment record:', paymentRecord ? 'YES' : 'NO');

        if (paymentRecord && paymentRecord.paymentStatus === 'PENDING') {
          // Update payment status based on responseCode
          if (vnp_ResponseCode === '00') {
            // ✅ Update payment status to PAID
            await this.paymentService.updateStatus(paymentRecord.paymentId, 'PAID');
            console.log('💰 [VNPay Manual Update] Payment marked as PAID for appointment:', appointmentId);
            
            // ✅ Update appointment status to SCHEDULED
            try {
              await this.appointmentService.updateStatus(appointmentId, 'SCHEDULED');
              console.log('📅 [VNPay Manual Update] Appointment status updated to SCHEDULED for appointment:', appointmentId);
            } catch (appointmentError) {
              console.error('💥 [VNPay Manual Update] Error updating appointment status:', appointmentError);
            }

            return {
              success: true,
              message: 'Payment and appointment status updated successfully',
              paymentId: paymentRecord.paymentId,
              appointmentId: appointmentId,
            };
          } else {
            await this.paymentService.updateStatus(paymentRecord.paymentId, 'UNPAID');
            console.log('❌ [VNPay Manual Update] Payment marked as UNPAID for appointment:', appointmentId);
            
            return {
              success: false,
              message: 'Payment failed',
              paymentId: paymentRecord.paymentId,
              appointmentId: appointmentId,
            };
          }
        } else {
          if (!paymentRecord) {
            console.log('⚠️ [VNPay Manual Update] No payment record found for appointment:', appointmentId);
            return {
              success: false,
              message: 'Payment record not found',
            };
          } else {
            console.log('⚠️ [VNPay Manual Update] Payment already processed. Current status:', paymentRecord.paymentStatus);
            return {
              success: true,
              message: 'Payment already processed',
              paymentStatus: paymentRecord.paymentStatus,
            };
          }
        }
      } catch (updateError) {
        console.error('💥 [VNPay Manual Update] Error updating payment status:', updateError);
        return {
          success: false,
          message: 'Error updating payment status',
          error: updateError.message,
        };
      }
    } catch (error) {
      console.error('💥 [VNPay Manual Update] Processing error:', error);
      return {
        success: false,
        message: 'Processing error',
        error: error.message,
      };
    }
  }
}
