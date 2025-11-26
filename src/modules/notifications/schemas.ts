import { z } from 'zod';

export const GenericPayloadSchema = z.record(z.string(), z.unknown());
export type GenericPayload = z.infer<typeof GenericPayloadSchema>;

export const WebhookSchema = z.object({
  eventName: z.string(),
  partner: z.string(),
  channel: z.string(),
  loanId: z.number(),
  loanApplicationNumber: z.string(),
  payload: z.record(z.string(), z.unknown()),
});

export type WebhookDto = z.infer<typeof WebhookSchema>;
