import { Provider } from './provider.interface';
import { fetcher } from '../../common/utils/fetcher';
import { getConfig } from '../../common/utils/config.util';
import {
  DmiMappedPayload,
  DmiTemplate,
  LtvBreachPayloadSchema,
} from '../../modules/providers/schemas.dmi';
import { WebhookDto } from '../../modules/notifications/schemas';

export class DmiQuickworkProvider implements Provider {
  mapPayload(template: DmiTemplate, event: WebhookDto): DmiMappedPayload {
    const merged = {
      loanId: event.loanId,
      partner: event.partner,
      channel: event.channel,
      ...event.payload,
    };
    const data = LtvBreachPayloadSchema.parse(merged);
    return {
      arr: [
        {
          template_name: template.templateName,
          recipient: data.email,
          leadsource: data.leadSource,
          is_realtime: 'Y' as const,
          content_variables: {
            var1: data.opportunityName,
            var2: data.date,
            var3: String(data.breachAmount),
            var4: data.paymentLink,
          },
          subject_variables: {},
          buttons: {},
          uid: { id: '', type_of_id: '' },
        },
      ],
    };
  }

  send(mappedPayload: DmiMappedPayload) {
    return fetcher({
      url: 'https://apim.quickwork.co/uat2/50fin/0/comms',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        APIKey: getConfig('QUICKWORK_API_KEY')!,
      },
      payload: mappedPayload,
    });
  }
}
