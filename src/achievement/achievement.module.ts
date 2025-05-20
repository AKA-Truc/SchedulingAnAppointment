import { Module } from '@nestjs/common';
import { AchievementController } from './achievement.controller';
import { AchievementService } from './achievement.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AchievementController],
  providers: [AchievementService]
})
export class AchievementModule {}
