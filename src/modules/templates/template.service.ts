import { Injectable } from '@nestjs/common';
import { db } from '../../db/client';
import { notificationTemplates } from '../../db/schema/notification-templates';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class TemplateService {
  async resolve(eventName: string, channel: string, partner: string) {
    console.log('TemplateService.resolve() called');
    console.log('Inputs:', { eventName, channel, partner });

    console.log('Querying template from DB...');
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
    console.log('Template result from DB:', result);
    console.log('templateName from DB:', result?.templateName);

    if (!result) {
      console.log(
        `No template found for event="${eventName}", channel="${channel}", partner="${partner}"`,
      );
      throw new Error('No template found');
    }
    console.log('Template found:', result);
    return result;
  }
}
