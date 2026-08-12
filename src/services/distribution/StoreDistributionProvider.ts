import * as Application from 'expo-application';
import Constants from 'expo-constants';
import { IDistributionService, DistributionVersionInfo, UpdateCheckResult } from './types';

/**
 * Production Store Distribution Provider
 * Used when app is published on Google Play Store and Apple App Store.
 */
export class StoreDistributionProvider implements IDistributionService {
  getVersionInfo(): DistributionVersionInfo {
    const version = Application.nativeApplicationVersion || Constants.expoConfig?.version || '1.0.0';
    const buildNumber = Application.nativeBuildVersion || String(Constants.expoConfig?.android?.versionCode || 1);

    return {
      version,
      buildNumber,
      isBeta: false,
      variant: 'production',
    };
  }

  async checkForUpdate(): Promise<UpdateCheckResult> {
    // Standard in-app store update check stub (can be wired to sp-react-native-in-app-updates or Store API)
    return {
      updateAvailable: false,
    };
  }

  isFeedbackSupported(): boolean {
    // Tester feedback is disabled in public production store releases
    return false;
  }

  async startTesterFeedback(): Promise<boolean> {
    return false;
  }
}
