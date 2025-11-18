import { db } from '../db/client';
import { notificationLogs } from '../db/schema/notification-logs';
import { desc } from 'drizzle-orm';

export class NotificationLogsService {
  async getLogs() {
    const rows = await db
      .select()
      .from(notificationLogs)
      .orderBy(desc(notificationLogs.createdAt), desc(notificationLogs.sentAt));

    return rows;
  }
}
