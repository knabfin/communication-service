import {
  pgTable,
  serial,
  varchar,
  text,
  boolean,
  jsonb,
  timestamp,
} from 'drizzle-orm/pg-core';

export const notificationTemplates = pgTable('notification_templates', {
  id: serial('id').primaryKey(),
  eventName: varchar('event_name', { length: 100 }).notNull(),
  templateName: varchar('template_name', { length: 255 }).notNull(),
  channel: varchar('channel', { length: 50 }).notNull(), // EMAIL / SMS
  partner: varchar('partner', { length: 50 }).notNull(), // DMI / KNAB etc.
  bodyTemplate: text('body_template').notNull(),
  variables: jsonb('variables_json').notNull().$type<string[]>(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
});
