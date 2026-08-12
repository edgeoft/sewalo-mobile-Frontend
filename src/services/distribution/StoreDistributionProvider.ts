import * as Application from 'expo-application';
import Constants from 'expo-constants';
import { IDistributionService, DistributionVersionInfo, UpdateCheckResult } from './types';
import { ENV } from '@/constants/env';

/**
 * Play Store / App Store Production Distribution Provider
 * Fallback provider used for official app store production builds.
 */
export class StoreDistributionProvider implements IDistributionService {
  getVersionInfo(): DistributionVersionInfo {
    const version = Application.nativeApplicationVersion || Constants.expoConfig?.version || '1.0.0';
    const buildNumber = Application.nativeBuildVersion || String(Constants.expoConfig?.android?.versionCode || 1);

    return {
      version,
      buildNumber,
      isBeta: false,
      variant: ENV.APP_ENV,
    };
  }

  async checkForUpdate(): Promise<UpdateCheckResult> {
    // Official store in-app updates flow
    return {
      updateAvailable: false,
    };
  }

  isFeedbackSupported(): boolean {
    return false;
  }

  async startTesterFeedback(): Promise<boolean> {
    return false;
  }
}
