import { Module } from '@nestjs/common';
import { WebhookController } from './webhook/webhook.controller';
import { NotificationLogsController } from 'src/notifications/notification-logs.controller';
import { ConfigService } from '@nestjs/config';
import { setConfigService } from 'src/common/utils/config.util';

@Module({
  controllers: [WebhookController, NotificationLogsController],
})
export class AppModule {
  constructor(private readonly configService: ConfigService) {
    setConfigService(configService);
  }
}
