import {
  pgTable,
  serial,
  varchar,
  integer,
  jsonb,
  timestamp,
} from 'drizzle-orm/pg-core';

export const notificationEvents = pgTable('notification_events', {
  id: serial('id').primaryKey(),
  eventName: varchar('event_name', { length: 100 }).notNull(),
  loanId: integer('loan_id').notNull(),
  partner: varchar('partner', { length: 50 }),
  payload: jsonb('payload_json').notNull(),
  status: varchar('status', { length: 20 }).default('PENDING'), // PENDING | PROCESSED | FAILED
  createdAt: timestamp('created_at').defaultNow(),
  processedAt: timestamp('processed_at'),
});
