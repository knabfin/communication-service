import { Controller, Get } from '@nestjs/common';
import { NotificationLogsService } from 'src/notifications/notification-logs.service';

@Controller('notifications')
export class NotificationLogsController {
  constructor(
    private readonly notificationLogsService: NotificationLogsService,
  ) {}

  @Get('logs')
  async getLogs() {
    return this.notificationLogsService.getLogs();
  }
}
