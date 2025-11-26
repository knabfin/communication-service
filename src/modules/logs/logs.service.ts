import { Injectable } from '@nestjs/common';
import { db } from '../../db/client';
import { notificationLogs } from '../../db/schema/notification-logs';
import {
  LogEventPayload,
  ProviderResponse,
  TemplateRow,
} from '../../modules/logs/log.types';
import { desc, sql } from 'drizzle-orm';

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
  // async getLogs() {
  //   return db
  //     .select()
  //     .from(notificationLogs)
  //     .orderBy(desc(notificationLogs.createdAt), desc(notificationLogs.sentAt));
  // }

  async getLogs(page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    // Get paginated data
    const data = await db
      .select({
        eventName: notificationLogs.eventName,
        channel: notificationLogs.channel,
        recipient: notificationLogs.recipient,
        status: notificationLogs.status,
        sent_at: notificationLogs.sentAt,
        template_id: notificationLogs.templateName,
        requestPayload: notificationLogs.requestPayload,
        responsePayload: notificationLogs.responsePayload,
      })
      .from(notificationLogs)
      .orderBy(desc(notificationLogs.sentAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalResult = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(notificationLogs);

    const total_count = Number(totalResult[0].count);

    const hasNext = page * limit < total_count;

    return {
      page,
      limit,
      total_count,
      hasNext,
      data,
    };
  }
}
