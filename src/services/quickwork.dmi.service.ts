import { getConfig } from 'src/common/utils/config.util';
import { fetcher } from 'src/common/utils/fetcher';
import { Result } from 'src/common/utils/result';

export interface QuickworkSingleMessage {
  template_name: string;
  recipient: string;
  leadsource: string;
  is_realtime: 'Y' | 'N';
  content_variables: {
    var1: string; // Opportunity name
    var2: string; // Current date
    var3: string; // Breach amount
    var4: string; // Payment link
  };
  subject_variables: Record<string, unknown>;
  buttons: Record<string, unknown>;
  uid: {
    id: string;
    type_of_id: string;
  };
}

export interface QuickworkPayload {
  arr: QuickworkSingleMessage[];
}

export class DmiQuickworkProvider {
  async send(payload: QuickworkPayload): Promise<Result<unknown>> {
    return fetcher({
      url: 'https://apim.quickwork.co/uat2/50fin/0/comms',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        APIKey: getConfig('QUICKWORK_API_KEY')!,
      },
      payload,
      timeoutInMillis: 15000,
    });
  }
}
