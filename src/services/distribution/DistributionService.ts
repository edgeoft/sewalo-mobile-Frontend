import { IDistributionService, DistributionVersionInfo, UpdateCheckResult } from './types';
import { FirebaseDistributionProvider } from './FirebaseDistributionProvider';
import { StoreDistributionProvider } from './StoreDistributionProvider';
import { ENV } from '@/constants/env';

/**
 * Distribution Service Strategy Manager
 * Dynamically resolves the provider based on process.env.EXPO_PUBLIC_ENV (ENV.APP_ENV).
 * Dev / Staging / Beta -> Firebase App Distribution
 * Production -> Store Distribution
 */
class DistributionServiceManager implements IDistributionService {
  private activeProvider: IDistributionService;

  constructor() {
    const env = ENV.APP_ENV;
    if (env === 'production' || env === 'prod') {
      this.activeProvider = new StoreDistributionProvider();
    } else {
      this.activeProvider = new FirebaseDistributionProvider();
    }
  }

  getVersionInfo(): DistributionVersionInfo {
    return this.activeProvider.getVersionInfo();
  }

  async checkForUpdate(): Promise<UpdateCheckResult> {
    return this.activeProvider.checkForUpdate();
  }

  isFeedbackSupported(): boolean {
    return this.activeProvider.isFeedbackSupported();
  }

  async startTesterFeedback(): Promise<boolean> {
    return this.activeProvider.startTesterFeedback();
  }
}

export const distributionService = new DistributionServiceManager();
