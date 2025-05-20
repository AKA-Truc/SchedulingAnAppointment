import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsEnum, IsNumber } from 'class-validator';
import { PaymentMethodEnum, PaymentStatusEnum } from '@prisma/client';

export class CreatePayment {
    @ApiProperty({ example: 1, description: 'ID cuộc hẹn' })
    @IsInt()
    @IsNotEmpty()
    Appointment_ID: number;

    @ApiProperty({ example: 100.5, description: 'Số tiền thanh toán' })
    @IsNumber()
    @IsNotEmpty()
    Price: number;

    @ApiProperty({ example: PaymentMethodEnum.CARD, description: 'Phương thức thanh toán' })
    @IsEnum(PaymentMethodEnum)
    @IsNotEmpty()
    Payment_Method: PaymentMethodEnum;

    @ApiProperty({ example: PaymentStatusEnum.PAID, description: 'Trạng thái thanh toán' })
    @IsEnum(PaymentStatusEnum)
    @IsNotEmpty()
    Payment_Status: PaymentStatusEnum;
}
