import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { setConfigService } from './common/utils/config.util';

import { LogsModule } from './modules/logs/logs.module';
import { HealthController } from './health/health.controller';
import { WebhookModule } from './modules/webhook/webhook.module';
import { DispatcherModule } from './modules/dispatcher/dispatcher.module';
import { TemplateModule } from './modules/templates/template.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    WebhookModule,
    DispatcherModule,
    TemplateModule,
    LogsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {
  constructor(configService: ConfigService) {
    setConfigService(configService);
  }
}
