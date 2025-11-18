import { z } from 'zod';

export const LtvBreachPayloadSchema = z.object({
  loanId: z.number(),
  email: z.string().optional(),
  opportunityName: z.string(),
  leadSource: z.string(),
  breachAmount: z.number(),
  paymentLink: z.string(),
  date: z.string(),
  partner: z.string(),
  channel: z.string(),
  templateName: z.string(),
});

export const WebhookSchema = z.object({
  eventName: z.literal('LTV_BREACH'),
  payload: LtvBreachPayloadSchema,
});

export type WebhookDto = z.infer<typeof WebhookSchema>;
export type LtvBreachPayloadDto = z.infer<typeof LtvBreachPayloadSchema>;
