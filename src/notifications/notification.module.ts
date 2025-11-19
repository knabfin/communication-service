import { Module } from '@nestjs/common';
import { NotificationLogsService } from 'src/notifications/notification-logs.service';
import { NotificationService } from 'src/services/notification.service';
import { ProviderSelector } from 'src/services/provider.selector';
import { DmiQuickworkProvider } from 'src/services/quickwork.dmi.service';
import { TemplateService } from 'src/services/template.service';

@Module({
  providers: [
    NotificationService,
    TemplateService,
    ProviderSelector,
    DmiQuickworkProvider,
    NotificationLogsService,
  ],
  exports: [NotificationService, NotificationLogsService],
})
export class NotificationModule {}
