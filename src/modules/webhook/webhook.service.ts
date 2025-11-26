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
    console.log('Webhook received:', body);

    console.log('Checking for existing event...');
    const existing = await db.query.notificationEvents.findFirst({
      where: and(
        eq(notificationEvents.eventName, body.eventName),
        eq(notificationEvents.loanId, body.loanId),
        eq(notificationEvents.partner, body.partner),
      ),
    });

    if (existing) {
      console.log('Duplicate event found. Skipping processing:', existing);
      return { status: 'duplicate_ignored' };
    }
    console.log('Inserting new notification event into DB...');
    const [inserted] = await db
      .insert(notificationEvents)
      .values({
        eventName: body.eventName,
        loanId: body.loanId,
        loanApplicationNumber: body.loanApplicationNumber,
        partner: body.partner,
        payload: body.payload,
        status: 'PENDING',
      })
      .returning();
    console.log('Event inserted successfully:', inserted);
    try {
      console.log('Dispatching event...');
      await this.dispatcher.dispatch(body);
      console.log('Event dispatched successfully');
      console.log('Updating status to PROCESSED...');
      await db
        .update(notificationEvents)
        .set({ status: 'PROCESSED', processedAt: new Date() })
        .where(eq(notificationEvents.id, inserted.id));
      console.log('Event marked as PROCESSED');
      return { status: 'processed' };
    } catch (err) {
      console.error('Error occurred while dispatching:', err);
      console.log('Updating status to FAILED...');
      await db
        .update(notificationEvents)
        .set({ status: 'FAILED', processedAt: new Date() })
        .where(eq(notificationEvents.id, inserted.id));
      console.log('Event marked as FAILED');
      return { status: 'failed', error: String(err) };
    }
  }
}
