import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { Public } from './auth/guard/auth.guard';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get('health')
  async getHealth() {
    const healthStatus = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        app: 'healthy',
        redis: 'unknown',
        database: 'unknown'
      }
    };

    // Check Redis connection
    try {
      await this.redis.ping();
      healthStatus.services.redis = 'healthy';
    } catch (error) {
      healthStatus.services.redis = 'unhealthy';
      healthStatus.status = 'degraded';
    }

    // You can add database check here if needed
    // try {
    //   await this.prisma.$queryRaw`SELECT 1`;
    //   healthStatus.services.database = 'healthy';
    // } catch (error) {
    //   healthStatus.services.database = 'unhealthy';
    //   healthStatus.status = 'degraded';
    // }

    return healthStatus;
  }
}
