import { Module } from '@nestjs/common';
import { DispatcherService } from './dispatcher.service';
import { TemplateModule } from '../templates/template.module';

import { LogsModule } from '../logs/logs.module';
import { ProvidersModule } from '../providers/provider.module';

@Module({
  imports: [
    TemplateModule, // For templateService.resolve()
    ProvidersModule, // For ProviderSelector + providers
    LogsModule, // For logsService.log()
  ],
  providers: [DispatcherService],
  exports: [DispatcherService], // Needed by WebhookModule
})
export class DispatcherModule {}
