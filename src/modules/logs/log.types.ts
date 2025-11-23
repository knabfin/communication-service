import { GenericPayload } from '../notifications/schemas';
import { notificationTemplates } from '../../db/schema/notification-templates';

export type TemplateRow = typeof notificationTemplates.$inferSelect;

export interface ProviderResponse {
  success: boolean;
  data?: unknown;
  error?: unknown;
}

// instead of Record<string, unknown>, use generic payload
export type LogEventPayload = GenericPayload;
