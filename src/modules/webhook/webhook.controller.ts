import { Controller, Post, Body } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WebhookDto } from '../../modules/notifications/schemas';

@Controller('notifications')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('webhook')
  async receive(@Body() body: WebhookDto) {
    return this.webhookService.handleWebhook(body);
  }
}
