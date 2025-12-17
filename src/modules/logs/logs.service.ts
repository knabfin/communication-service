import { Injectable } from '@nestjs/common';
import { db } from '../../db/client';
import { notificationLogs } from '../../db/schema/notification-logs';
import { notificationEvents } from '../../db/schema/notification_events';
import {
  LogEventPayload,
  ProviderResponse,
  TemplateRow,
} from '../../modules/logs/log.types';
import { desc, sql, and, eq, count } from 'drizzle-orm';

export interface LogParams {
  eventName: string;
  payload: LogEventPayload;
  template: TemplateRow;
  providerPayload: unknown;
  response: ProviderResponse;
  loanApplicationNumber: string | null;
}

@Injectable()
export class LogsService {
  async log(params: LogParams) {
    const {
      eventName,
      payload,
      template,
      providerPayload,
      response,
      loanApplicationNumber,
    } = params;
    await db.insert(notificationLogs).values({
      eventName,
      templateName: template.templateName,
      channel: template.channel,
      partner: template.partner,
      recipient: typeof payload.email === 'string' ? payload.email : 'UNKNOWN',
      loanApplicationNumber: loanApplicationNumber,
      requestPayload: providerPayload,
      responsePayload: response,
      status: response.success ? 'SUCCESS' : 'FAILED',
      sentAt: new Date(),
    });
  }

  async getLogs(page: number = 1, limit: number = 10) {
    const currentPage = page > 0 ? page : 1;
    const pageLimit = limit > 0 ? limit : 10;
    const offset = (currentPage - 1) * pageLimit;

    const totalResult = await db
      .select({ count: count() })
      .from(notificationLogs);

    const total_count = Number(totalResult[0]?.count || 0);

    // get all the logs first
    const logs = await db
      .select({
        eventName: notificationLogs.eventName,
        channel: notificationLogs.channel,
        recipient: notificationLogs.recipient,
        status: notificationLogs.status,
        sent_at: notificationLogs.sentAt,
        template_id: notificationLogs.templateName,
        requestPayload: notificationLogs.requestPayload,
        responsePayload: notificationLogs.responsePayload,
        loanApplicationNumber: notificationLogs.loanApplicationNumber,
      })
      .from(notificationLogs)
      .orderBy(desc(notificationLogs.sentAt))
      .limit(pageLimit)
      .offset(offset);

    // for each log, get its event payload with Processed check
    const data = await Promise.allSettled(
      logs.map(async (log) => {
        let eventPayload: Record<string, unknown> | null = null;
        if (log.loanApplicationNumber) {
          const events = await db
            .select({ payload: notificationEvents.payload })
            .from(notificationEvents)
            .where(
              and(
                eq(notificationEvents.eventName, log.eventName),
                eq(
                  notificationEvents.loanApplicationNumber,
                  log.loanApplicationNumber,
                ),
                eq(notificationEvents.status, 'PROCESSED'),
              ),
            )
            .orderBy(desc(notificationEvents.createdAt))
            .limit(1);

          if (events.length > 0 && events[0].payload) {
            eventPayload = events[0].payload as Record<string, unknown>;
          }
        }

        return {
          ...log,
          eventPayload,
        };
      }),
    );

    const hasNext = offset + data.length < total_count;

    return {
      page: currentPage,
      limit: pageLimit,
      total_count,
      hasNext,
      data,
    };
  }
}
