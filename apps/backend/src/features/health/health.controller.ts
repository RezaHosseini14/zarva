import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { IHealthResponse } from '@zarva/shared';

import { Public } from '../../common/public.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'Liveness / version' })
  @ApiOkResponse({ description: 'Service is healthy' })
  getHealth(): IHealthResponse {
    return {
      status: 'ok',
      version: process.env.APP_VERSION ?? '0.1.0',
      timestamp: new Date().toISOString(),
    };
  }
}
