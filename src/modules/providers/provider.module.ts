import { Module } from '@nestjs/common';
import { ProviderSelector } from './provider.selector';

@Module({
  providers: [ProviderSelector],
  exports: [ProviderSelector],
})
export class ProvidersModule {}
