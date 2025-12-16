/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
    console.log('DmiQuickworkProvider.mapPayload() started');

    if (!template?.templateName) {
      throw new Error('templateName is missing from template in provider');
    }

    console.log('templateName from template:', template?.templateName);

    console.log('Incoming event:', event);
    const merged = {
      loanId: event.loanId,
      partner: event.partner,
      channel: event.channel,
      ...event.payload,
    };

    /**
     * Build content_variables dynamically from DB template
     */
    const content_variables: Record<string, string> = {};

    template.variables.forEach((variableName, index) => {
      const varKey = `var${index + 1}`;
      const value = event.payload[variableName];
      content_variables[varKey] = String(value);
    });

    console.log('Resolved content_variables:', content_variables);

    let data;
    try {
      data = LtvBreachPayloadSchema.parse(merged);
      console.log('Zod validation success:', data);
    } catch (err) {
      console.error('Zod validation failed:', err);
      throw err;
    }

    const finalPayload: DmiMappedPayload = {
      arr: [
        {
          template_name: template.templateName,
          'recipient ':
            typeof data.email === 'string' ? data.email : data.email.email,
          leadsource: data.leadSource,
          is_realtime: 'Y',
          content_variables,
          subject_variables: {},
          buttons: {},
          uid: { id: '', type_of_id: '' },
        },
      ],
    };
    console.log('Final provider payload:', finalPayload);
    return finalPayload;
  }

  async send(mappedPayload: DmiMappedPayload) {
    console.log('Sending payload to Quickwork...', mappedPayload);

    const response = await fetcher({
      url: 'https://apim.quickwork.co/uat2/50fin/0/comms',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        APIKey: getConfig('QUICKWORK_API_KEY')!,
      },
      payload: mappedPayload,
    });

    console.log('Quickwork raw response:', response);

    return response;
  }
}
