import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { PaymentMethodEnum, PaymentStatusEnum } from '@prisma/client';

export class UpdatePayment {
    @ApiProperty({ example: 1, description: 'ID cuộc hẹn', required: false })
    @IsInt()
    @IsOptional()
    appointmentId?: number;

    @ApiProperty({ example: 100.5, description: 'Số tiền thanh toán', required: false })
    @IsNumber()
    @IsOptional()
    price?: number;

    @ApiProperty({ example: PaymentMethodEnum.CARD, description: 'Phương thức thanh toán', required: false })
    @IsEnum(PaymentMethodEnum)
    @IsOptional()
    paymentMethod?: PaymentMethodEnum;

    @ApiProperty({ example: PaymentStatusEnum.PENDING, description: 'Trạng thái thanh toán', required: false })
    @IsEnum(PaymentStatusEnum)
    @IsOptional()
    paymentStatus?: PaymentStatusEnum;
}
