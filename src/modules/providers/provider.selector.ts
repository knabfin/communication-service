import { DmiQuickworkProvider } from './dmi.quickwork.provider';

export class ProviderSelector {
  static getProvider(partner: string) {
    switch (partner) {
      case 'DMI':
        return new DmiQuickworkProvider();

      default:
        throw new Error(`Provider not configured for partner ${partner}`);
    }
  }
}
