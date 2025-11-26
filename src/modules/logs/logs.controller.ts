import { Controller, Get, Query } from '@nestjs/common';
import { LogsService } from './logs.service';

@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  async getLogs(@Query('page') page?: string, @Query('limit') limit?: string) {
    const parsedPage = Math.max(parseInt(page || '1', 10), 1);
    const parsedLimit = Math.min(Math.max(parseInt(limit || '10', 10), 1), 100);
    // Min = 1, Max = 100
    return this.logsService.getLogs(parsedPage, parsedLimit);
  }
}
