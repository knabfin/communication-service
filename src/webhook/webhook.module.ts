import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { NotificationModule } from '../notifications/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [WebhookController],
})
export class WebhookModule {}
