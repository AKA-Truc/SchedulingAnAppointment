import { Module } from '@nestjs/common';
import { PrescriptionItemController } from './prescription-item.controller';
import { PrescriptionItemService } from './prescription-item.service';

@Module({
  controllers: [PrescriptionItemController],
  providers: [PrescriptionItemService]
})
export class PrescriptionItemModule {}
