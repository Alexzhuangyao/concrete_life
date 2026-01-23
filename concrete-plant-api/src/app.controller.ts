import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { FeatureManager, ConfigManager } from '@concrete-plant/core';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }

  @Get('api/health')
  getApiHealth() {
    return this.appService.getHealth();
  }

  @Get('api/config/runtime')
  getRuntimeConfig() {
    const config = ConfigManager.getConfig();
    const features = FeatureManager.getAll();
    
    return {
      mode: config.mode,
      features: features,
      database: config.database.type,
      plc: {
        enabled: config.plc?.enabled || false,
        host: config.plc?.host,
      },
      cloudSync: {
        enabled: config.cloudSync?.enabled || false,
        apiUrl: config.cloudSync?.apiUrl,
      },
    };
  }
}
