import { z } from 'zod';

export const DmiTemplateSchema = z.object({
  templateName: z.string(),
  channel: z.string(),
  partner: z.string(),
  variables: z.array(z.string()),
});

export type DmiTemplate = z.infer<typeof DmiTemplateSchema>;

export const DmiMappedPayloadSchema = z.object({
  arr: z.array(
    z.object({
      template_name: z.string(),
      'recipient ': z.string(),
      leadsource: z.string(),
      is_realtime: z.enum(['Y', 'N']),
      content_variables: z.record(z.string(), z.string()),
      subject_variables: z.record(z.string(), z.unknown()).optional(),
      buttons: z.record(z.string(), z.unknown()).optional(),
      uid: z.object({
        id: z.string(),
        type_of_id: z.string(),
      }),
    }),
  ),
});

export type DmiMappedPayload = z.infer<typeof DmiMappedPayloadSchema>;

export const LtvBreachPayloadSchema = z.object({
  loanId: z.number(),
  email: z.string(),
  opportunityName: z.string().optional(),
  leadSource: z.string().optional(),
  breachAmount: z.number().optional(),
  paymentLink: z.string().optional(),
  date: z.string().optional(),
  partner: z.string().optional(),
  channel: z.string().optional(),
  name: z.string().optional(),
});

export const WebhookSchema = z.object({
  eventName: z.literal('LTV_BREACH'),
  payload: LtvBreachPayloadSchema,
});

export type WebhookDto = z.infer<typeof WebhookSchema>;
export type LtvBreachPayloadDto = z.infer<typeof LtvBreachPayloadSchema>;
