import { renderTemplate } from '../common/utils/mustache.helper';
import { db } from '../db/client';

import { eq, and } from 'drizzle-orm';
import { notificationTemplates } from '../db/schema/notification-templates';

export class TemplateService {
  static async getActiveTemplate(
    eventName: string,
    channel: string,
    partner: string,
  ) {
    const rows = await db
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

    return rows[0];
  }

  static render(template: string, variables: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return renderTemplate(template, variables);
  }
}
