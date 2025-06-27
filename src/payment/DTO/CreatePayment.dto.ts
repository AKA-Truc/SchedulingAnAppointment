import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsEnum, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethodEnum, PaymentStatusEnum } from '@prisma/client';

export class CreatePayment {
    @ApiProperty({ example: 1, description: 'ID cuộc hẹn' })
    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    appointmentId: number;

    @ApiProperty({ example: 100.5, description: 'Số tiền thanh toán' })
    @IsNumber()
    @IsNotEmpty()
    price: number;

    @ApiProperty({ example: PaymentMethodEnum.CARD, description: 'Phương thức thanh toán' })
    @IsEnum(PaymentMethodEnum)
    @IsNotEmpty()
    paymentMethod: PaymentMethodEnum;

    @ApiProperty({ example: PaymentStatusEnum.PAID, description: 'Trạng thái thanh toán' })
    @IsEnum(PaymentStatusEnum)
    @IsNotEmpty()
    paymentStatus: PaymentStatusEnum;
}
