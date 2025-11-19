import { Module } from '@nestjs/common';
import { WebhookController } from './webhook/webhook.controller';
import { NotificationLogsController } from 'src/notifications/notification-logs.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { setConfigService } from 'src/common/utils/config.util';
import { NotificationModule } from 'src/notifications/notification.module';
import { WebhookModule } from 'src/webhook/webhook.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    NotificationModule,
    WebhookModule,
  ],

  controllers: [WebhookController, NotificationLogsController],
})
export class AppModule {
  constructor(private readonly configService: ConfigService) {
    setConfigService(configService);
  }
}
