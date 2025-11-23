import { Injectable } from '@nestjs/common';
import { db } from '../../db/client';
import { notificationEvents } from '../../db/schema/notification_events';
import { eq, and } from 'drizzle-orm';
import { DispatcherService } from '../dispatcher/dispatcher.service';
import { WebhookDto } from '../../modules/notifications/schemas';

@Injectable()
export class WebhookService {
  constructor(private readonly dispatcher: DispatcherService) {}

  async handleWebhook(body: WebhookDto) {
    const existing = await db.query.notificationEvents.findFirst({
      where: and(
        eq(notificationEvents.eventName, body.eventName),
        eq(notificationEvents.loanId, body.loanId),
        eq(notificationEvents.partner, body.partner),
      ),
    });

    if (existing) {
      return { status: 'duplicate_ignored' };
    }

    const [inserted] = await db
      .insert(notificationEvents)
      .values({
        eventName: body.eventName,
        loanId: body.loanId,
        partner: body.partner,
        payload: body.payload,
        status: 'PENDING',
      })
      .returning();

    try {
      await this.dispatcher.dispatch(body);

      await db
        .update(notificationEvents)
        .set({ status: 'PROCESSED', processedAt: new Date() })
        .where(eq(notificationEvents.id, inserted.id));

      return { status: 'processed' };
    } catch (err) {
      await db
        .update(notificationEvents)
        .set({ status: 'FAILED', processedAt: new Date() })
        .where(eq(notificationEvents.id, inserted.id));

      return { status: 'failed', error: String(err) };
    }
  }
}
