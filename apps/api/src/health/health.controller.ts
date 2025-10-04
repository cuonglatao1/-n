import { Controller, Get, HttpStatus, HttpCode } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private healthService: HealthService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async checkHealth() {
    const healthStatus = await this.healthService.checkHealth();
    
    return {
      success: true,
      data: healthStatus,
    };
  }
}

