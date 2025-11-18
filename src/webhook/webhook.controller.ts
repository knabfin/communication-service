import { Controller, Post, Body } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { db } from '../db/client';
import { notificationEvents } from '../db/schema/notification_events';
import { WebhookSchema, type WebhookDto } from 'src/notifications/schemas';
import { NotificationService } from 'src/services/notification.service';
import { eq } from 'drizzle-orm';

@Controller('notifications')
export class WebhookController {
  @Post('webhook')
  async receiveWebhook(
    @Body(new ZodValidationPipe(WebhookSchema)) body: WebhookDto,
  ) {
    // 1️ Insert into DB first (status = PENDING)
    const inserted = await db
      .insert(notificationEvents)
      .values({
        eventName: body.eventName,
        loanId: body.payload.loanId,
        customerId: null,
        partner: body.payload.partner,
        payload: body.payload,
        status: 'PENDING',
        createdAt: new Date(),
      })
      .returning({ id: notificationEvents.id });

    const eventId = inserted[0].id;

    // process it
    const service = new NotificationService();

    try {
      await service.processEvent(body);

      // 3 Update event status -> PROCESSED
      await db
        .update(notificationEvents)
        .set({ status: 'PROCESSED', processedAt: new Date() })
        .where(eq(notificationEvents.id, eventId));

      return { status: 'processed' };
    } catch (error) {
      console.error('Notification failed:', error);

      // 4️ Update event status -> FAILED
      await db
        .update(notificationEvents)
        .set({ status: 'FAILED', processedAt: new Date() })
        .where(eq(notificationEvents.id, eventId));

      return { status: 'failed', error: String(error) };
    }
  }
}
