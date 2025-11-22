import { Injectable } from '@nestjs/common';
import { TemplateService } from '../templates/template.service';
import { ProviderSelector } from '../providers/provider.selector';
import { LogsService } from '../logs/logs.service';
import { WebhookDto } from '../../modules/notifications/schemas';

@Injectable()
export class DispatcherService {
  constructor(
    private templateService: TemplateService,
    private logService: LogsService,
  ) {}

  async dispatch(event: WebhookDto) {
    // 1️ Get template (based on eventName, channel, partner)
    const template = await this.templateService.resolve(
      event.eventName,
      event.channel,
      event.partner,
    );
    // 2 Validate template.variables exist in the event.payload
    if (template.variables && template.variables.length > 0) {
      for (const variable of template.variables) {
        if (!(variable in event.payload)) {
          throw new Error(
            `Payload missing required template variable: '${variable}'`,
          );
        }
      }
    }
    // 3️ Select provider using template.partner
    const provider = ProviderSelector.getProvider(template.partner);
    // 4️ Provider maps + validates the payload
    const providerPayload = provider.mapPayload(template, event);
    // 5️ Provider sends the notification
    const response = await provider.send(providerPayload);
    await this.logService.log({
      eventName: event.eventName,
      payload: event.payload,
      template,
      providerPayload,
      response,
    });

    return response;
  }
}
