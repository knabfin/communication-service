import {
  pgTable,
  serial,
  varchar,
  jsonb,
  timestamp,
} from 'drizzle-orm/pg-core';

export const notificationLogs = pgTable('notification_logs', {
  id: serial('id').primaryKey(),

  eventName: varchar('event_name', { length: 100 }).notNull(),
  templateName: varchar('template_name', { length: 255 }).notNull(),
  channel: varchar('channel', { length: 50 }).notNull(),
  partner: varchar('partner', { length: 50 }).notNull(),
  recipient: varchar('recipient', { length: 255 }).notNull(),
  requestPayload: jsonb('request_payload').notNull(),
  responsePayload: jsonb('response_payload'),
  status: varchar('status', { length: 20 }).notNull(), // SUCCESS / FAILED
  sentAt: timestamp('sent_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
