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

    console.log('Incoming template:', template);
    console.log('templateName from template:', template?.templateName);

    console.log('Incoming event:', event);
    console.log('Incoming payload:', event.payload);
    const merged = {
      loanId: event.loanId,
      partner: event.partner,
      channel: event.channel,
      ...event.payload,
    };
    console.log('Merged payload before validation:', merged);
    // const data = LtvBreachPayloadSchema.parse(merged);
    let data;
    try {
      data = LtvBreachPayloadSchema.parse(merged);
      console.log('Zod validation success:', data);
    } catch (err) {
      console.error('Zod validation failed:', err);
      throw err;
    }
    if (!template?.templateName) {
      console.error('template.templateName is UNDEFINED:', template);
      throw new Error('templateName is missing from template in provider');
    }

    function toDmiFormattedDate(dateString: string): string {
      const [day, month, year] = dateString.split('-');

      const monthNames = [
        'jan',
        'feb',
        'mar',
        'apr',
        'may',
        'jun',
        'jul',
        'aug',
        'sep',
        'oct',
        'nov',
        'dec',
      ];

      const monthIndex = Number(month) - 1;

      return `${day}-${monthNames[monthIndex]}-${year}`;
    }

    const finalPayload: DmiMappedPayload = {
      arr: [
        {
          template_name: template.templateName,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          recipient: data.email,
          leadsource: data.leadSource,
          is_realtime: 'Y' as const,
          content_variables: {
            var1: data.opportunityName,
            var2: toDmiFormattedDate(data.date),
            var3: String(data.breachAmount),
            var4: data.paymentLink,
          },
          subject_variables: {},
          buttons: {},
          uid: { id: '', type_of_id: '' },
        },
      ],
    };
    console.log('Final provider payload:', finalPayload);
    console.log('DmiQuickworkProvider.mapPayload() finished');

    return finalPayload;
  }

  async send(mappedPayload: DmiMappedPayload) {
    console.log('Sending payload to Quickwork...');
    console.log('Outgoing payload:', mappedPayload);
    try {
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
    } catch (error) {
      console.error('Error:', error);

      throw error;
    }
  }
}
