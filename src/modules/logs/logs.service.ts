import { Injectable } from '@nestjs/common';
import { db } from '../../db/client';
import { notificationLogs } from '../../db/schema/notification-logs';
import {
  LogEventPayload,
  ProviderResponse,
  TemplateRow,
} from '../../modules/logs/log.types';
import { desc } from 'drizzle-orm';

export interface LogParams {
  eventName: string;
  payload: LogEventPayload;
  template: TemplateRow;
  providerPayload: unknown;
  response: ProviderResponse;
}

@Injectable()
export class LogsService {
  async log(params: LogParams) {
    const { eventName, payload, template, providerPayload, response } = params;
    await db.insert(notificationLogs).values({
      eventName,
      templateName: template.templateName,
      channel: template.channel,
      partner: template.partner,
      recipient: typeof payload.email === 'string' ? payload.email : 'UNKNOWN',
      requestPayload: providerPayload,
      responsePayload: response,
      status: response.success ? 'SUCCESS' : 'FAILED',
      sentAt: new Date(),
    });
  }
  async getLogs() {
    return db
      .select()
      .from(notificationLogs)
      .orderBy(desc(notificationLogs.createdAt), desc(notificationLogs.sentAt));
  }
}
