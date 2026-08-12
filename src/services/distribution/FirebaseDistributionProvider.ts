import { NativeModules, Platform } from 'react-native';
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import { IDistributionService, DistributionVersionInfo, UpdateCheckResult } from './types';
import { ENV } from '@/constants/env';

/**
 * Firebase App Distribution Provider
 * Used for development/staging testing, tester feedback, and in-app update alerts.
 */
export class FirebaseDistributionProvider implements IDistributionService {
  getVersionInfo(): DistributionVersionInfo {
    const version = Application.nativeApplicationVersion || Constants.expoConfig?.version || '0.1.0';
    const buildNumber = Application.nativeBuildVersion || String(Constants.expoConfig?.android?.versionCode || 1);

    return {
      version,
      buildNumber,
      isBeta: true,
      variant: ENV.APP_ENV,
    };
  }

  async checkForUpdate(): Promise<UpdateCheckResult> {
    try {
      // Check if Firebase App Distribution native module exists
      const FirebaseAppDistributionModule = NativeModules.RNFirebaseAppDistribution;
      if (FirebaseAppDistributionModule && typeof FirebaseAppDistributionModule.checkForUpdate === 'function') {
        const updateInfo = await FirebaseAppDistributionModule.checkForUpdate();
        return {
          updateAvailable: Boolean(updateInfo?.isUpdateAvailable),
          latestVersion: updateInfo?.latestVersion || undefined,
          releaseNotes: updateInfo?.releaseNotes || undefined,
          isMandatory: Boolean(updateInfo?.isMandatory),
        };
      }

      // Safe fallback for dev mode or when native plugin hasn't compiled yet
      return {
        updateAvailable: false,
      };
    } catch (error) {
      console.warn('[FirebaseDistributionProvider] Check for updates failed:', error);
      return { updateAvailable: false };
    }
  }

  isFeedbackSupported(): boolean {
    // In-app tester feedback is supported on native Android/iOS beta builds
    return Platform.OS === 'android' || Platform.OS === 'ios';
  }

  async startTesterFeedback(): Promise<boolean> {
    try {
      const FirebaseAppDistributionModule = NativeModules.RNFirebaseAppDistribution;
      if (FirebaseAppDistributionModule && typeof FirebaseAppDistributionModule.startFeedback === 'function') {
        await FirebaseAppDistributionModule.startFeedback();
        return true;
      }
      return false;
    } catch (error) {
      console.warn('[FirebaseDistributionProvider] Start tester feedback failed:', error);
      return false;
    }
  }
}
