import { Injectable } from '@nestjs/common';
import { db } from '../../db/client';
import { notificationTemplates } from '../../db/schema/notification-templates';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class TemplateService {
  async resolve(eventName: string, channel: string, partner: string) {
    const [result] = await db
      .select()
      .from(notificationTemplates)
      .where(
        and(
          eq(notificationTemplates.eventName, eventName),
          eq(notificationTemplates.channel, channel),
          eq(notificationTemplates.partner, partner),
          eq(notificationTemplates.isActive, true),
        ),
      );

    if (!result) throw new Error('No template found');
    return result;
  }
}
