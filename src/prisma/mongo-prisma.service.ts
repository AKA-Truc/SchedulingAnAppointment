import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '../../prisma/generated/mongodb';

@Injectable()
export class MongoPrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MongoPrismaService.name);

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('✅ Connected to MongoDB via Prisma');
    } catch (err) {
      this.logger.error('❌ Failed to connect to MongoDB', err);
      throw err;
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.$disconnect();
      this.logger.log('🛑 Disconnected from MongoDB');
    } catch (err) {
      this.logger.error('⚠️ Error disconnecting MongoDB', err);
    }
  }
}
