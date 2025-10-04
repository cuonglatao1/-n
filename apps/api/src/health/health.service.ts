import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private prisma: PrismaService) {}

  async checkHealth() {
    const startTime = Date.now();
    
    try {
      // Check database connectivity
      await this.prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - startTime;

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'canvas-llm-api',
        uptime: process.uptime(),
        database: {
          status: 'connected',
          responseTime: `${responseTime}ms`,
        },
        environment: process.env.NODE_ENV || 'development',
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;

      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        service: 'canvas-llm-api',
        uptime: process.uptime(),
        database: {
          status: 'disconnected',
          responseTime: `${responseTime}ms`,
          error: error.message,
        },
        environment: process.env.NODE_ENV || 'development',
      };
    }
  }
}

