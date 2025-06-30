import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);

    async onModuleInit(): Promise<void> {
        try {
            await this.$connect();
            this.logger.log('✅ Connected to PostgreSQL via Prisma');
        } catch (err) {
            this.logger.error('❌ Failed to connect to PostgreSQL', err);
            throw err;
        }
    }

    async onModuleDestroy(): Promise<void> {
        try {
            await this.$disconnect();
            this.logger.log('🛑 Disconnected from PostgreSQL');
        } catch (err) {
            this.logger.error('⚠️ Error disconnecting PostgreSQL', err);
        }
    }
}
