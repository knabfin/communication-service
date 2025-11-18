import { DmiQuickworkProvider } from './quickwork.dmi.service';

export class ProviderSelector {
  static getProvider(partner: string) {
    switch (partner) {
      case 'DMI':
        return new DmiQuickworkProvider();

      default:
        throw new Error(`No provider configured for partner: ${partner}`);
    }
  }
}
