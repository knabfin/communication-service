import { ConfigService } from '@nestjs/config';

// Singleton-style holder
let configService: ConfigService;

export const setConfigService = (service: ConfigService) => {
  configService = service;
};

export const getConfig = (key: string) => {
  if (!configService) {
    throw new Error(
      'ConfigService not initialized. Call setConfigService first.',
    );
  }
  return configService.get<string>(key);
};
