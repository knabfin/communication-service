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
    console.log('Dispatcher started');
    console.log('Incoming event:', event);

    // Get template
    console.log(
      ` Resolving template for: eventName=${event.eventName}, channel=${event.channel}, partner=${event.partner}`,
    );

    // 1️ Get template (based on eventName, channel, partner)
    const template = await this.templateService.resolve(
      event.eventName,
      event.channel,
      event.partner,
    );
    console.log('Template resolved:', template);
    // 2 Validate template.variables exist in the event.payload
    console.log('Validating template variables...');
    if (template.variables && template.variables.length > 0) {
      for (const variable of template.variables) {
        console.log(`Checking variable: ${variable}`);

        if (!(variable in event.payload)) {
          console.log(
            `Payload missing required template variable: '${variable}'`,
          );
          throw new Error(
            `Payload missing required template variable: '${variable}'`,
          );
        }
      }
      console.log('All required variables are present in payload');
    } else {
      console.log('No template variables to validate');
    }
    // 3️ Select provider using template.partner
    console.log(`Selecting provider for partner: ${template.partner}`);
    const provider = ProviderSelector.getProvider(template.partner);
    console.log('Provider selected:', provider?.constructor?.name);
    // 4️ Provider maps + validates the payload
    console.log('Mapping payload for provider...', provider);
    console.log('Checking templateName before mapping:', {
      templateName: template?.templateName,
      fullTemplate: template,
    });

    const providerPayload = provider.mapPayload(template, event);
    console.log('Provider payload generated:', providerPayload);
    // 5️ Provider sends the notification
    console.log('Sending notification via provider...');
    const response = await provider.send(providerPayload);
    console.log('Provider response received:', response);
    console.log('Saving notification log...');
    await this.logService.log({
      eventName: event.eventName,
      payload: event.payload,
      template,
      providerPayload,
      response,
    });
    console.log('Log saved successfully');
    console.log('Dispatcher finished');

    return response;
  }
}
