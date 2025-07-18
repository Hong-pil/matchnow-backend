import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

import { AppHealthIndicator } from './app.health';

@Controller('/health')
export class AppController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly appHealthIndicator: AppHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([() => this.appHealthIndicator.isHealthy('app')]);
  }
}
