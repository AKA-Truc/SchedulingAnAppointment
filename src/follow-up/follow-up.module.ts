import { Module } from '@nestjs/common';
import { FollowUpController } from './follow-up.controller';
import { FollowUpService } from './follow-up.service';

@Module({
  controllers: [FollowUpController],
  providers: [FollowUpService]
})
export class FollowUpModule {}
