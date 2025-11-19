import { db } from '../db/client';

import { TemplateService } from './template.service';
import { ProviderSelector } from './provider.selector';
import { notificationLogs } from '../db/schema/notification-logs';
import { WebhookDto } from '../notifications/schemas';

export class NotificationService {
  async processEvent(event: WebhookDto) {
    const { eventName, payload } = event;

    const template = await TemplateService.getActiveTemplate(
      eventName,
      payload.channel || 'EMAIL',
      payload.partner || 'DMI',
    );

    if (!template) throw new Error('No template found');

    // const body = TemplateService.render(template.bodyTemplate, payload);

    const provider = ProviderSelector.getProvider(template.partner);
    if (!payload.email) throw new Error('Recipient email missing');
    const requestPayload = {
      arr: [
        {
          template_name: template.templateName,
          recipient: payload.email,
          leadsource: payload.leadSource,
          is_realtime: 'Y' as const,
          content_variables: {
            var1: payload.opportunityName,
            var2: payload.date,
            var3: String(payload.breachAmount),
            var4: payload.paymentLink,
          },
          subject_variables: {},
          buttons: {},
          uid: { id: '', type_of_id: '' },
        },
      ],
    };

    const res = await provider.send(requestPayload);

    await db.insert(notificationLogs).values({
      eventName,
      templateName: template.templateName ?? 'UNKNOWN_TEMPLATE',
      channel: template.channel ?? 'EMAIL',
      partner: template.partner ?? 'DMI',
      recipient: payload.email ?? 'UNKNOWN',
      requestPayload,
      responsePayload: res,
      status: res.success ? 'SUCCESS' : 'FAILED',
      sentAt: new Date(),
    });

    return res;
  }
}
