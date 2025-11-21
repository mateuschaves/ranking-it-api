import { Controller, Get, HttpStatus, HttpException } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './shared/services/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prismaService: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get("/debug-sentry")
  getError() {
    throw new Error("My first Sentry error!");
  }

  @Get("/health")
  async getHealth() {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'unknown',
    };

    try {
      // Test database connection
      await this.prismaService.$queryRaw`SELECT 1`;
      health.database = 'connected';
      return health;
    } catch (error) {
      health.database = 'disconnected';
      health.status = 'error';
      throw new HttpException(health, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
}
