import { Module } from '@nestjs/common';
import { SpecialtyController } from './specialty.controller';
import { SpecialtyService } from './specialty.service';

@Module({
  controllers: [SpecialtyController],
  providers: [SpecialtyService]
})
export class SpecialtyModule {}
