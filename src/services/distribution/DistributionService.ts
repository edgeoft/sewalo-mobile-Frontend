import { IDistributionService, DistributionVersionInfo, UpdateCheckResult } from './types';
import { FirebaseDistributionProvider } from './FirebaseDistributionProvider';
import { StoreDistributionProvider } from './StoreDistributionProvider';

/**
 * Distribution Service Strategy Manager
 * Resolves the appropriate provider dynamically based on EXPO_PUBLIC_APP_VARIANT
 */
class DistributionServiceManager implements IDistributionService {
  private activeProvider: IDistributionService;

  constructor() {
    const variant = process.env.EXPO_PUBLIC_APP_VARIANT || 'beta';
    if (variant === 'production') {
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
