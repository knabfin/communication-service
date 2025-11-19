import { Module } from '@nestjs/common';
import { WebhookController } from './webhook/webhook.controller';
import { NotificationLogsController } from './notifications/notification-logs.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { setConfigService } from './common/utils/config.util';
import { NotificationModule } from './notifications/notification.module';
import { WebhookModule } from './webhook/webhook.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    NotificationModule,
    WebhookModule,
  ],

  controllers: [
    WebhookController,
    NotificationLogsController,
    HealthController,
  ],
})
export class AppModule {
  constructor(private readonly configService: ConfigService) {
    setConfigService(configService);
  }
}
