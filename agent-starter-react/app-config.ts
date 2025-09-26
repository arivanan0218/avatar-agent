import type { AppConfig } from './lib/types';

export const APP_CONFIG_DEFAULTS: AppConfig = {
  companyName: 'Rise AI',
  pageTitle: 'Rise AI Customer Support',
  pageDescription: 'Get help from our AI assistant',

  supportsChatInput: true,
  supportsVideoInput: true,
  supportsScreenShare: false,
  isPreConnectBufferEnabled: true,

  logo: '/rise_icon.png',
  accent: '#000000',
  logoDark: '/rise_icon.png',
  accentDark: '#ffffff',
  startButtonText: 'Start Support Session',
};
