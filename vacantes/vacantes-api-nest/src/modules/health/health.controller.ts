import { Controller, Get } from '@nestjs/common';

@Controller('api/health')
export class HealthController {
  @Get()
  status() {
    return {
      status: 'ok',
      service: 'vacantes-api-nest',
    };
  }
}
