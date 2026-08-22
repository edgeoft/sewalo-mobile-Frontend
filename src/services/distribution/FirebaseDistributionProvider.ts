import { NativeModules, Platform, Linking } from 'react-native';
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
    const version = Constants.expoConfig?.version || Application.nativeApplicationVersion || '0.3.0';
    const buildNumber = String(
      Constants.expoConfig?.extra?.buildNumber ||
        Constants.expoConfig?.android?.versionCode ||
        Application.nativeBuildVersion ||
        1,
    );
    const envVariant =
      (Constants.expoConfig?.extra?.envVariant as string) ||
      (ENV.APP_ENV === 'prod' || ENV.APP_ENV === 'production' ? 'production' : 'beta');
    const isBeta = envVariant !== 'production';

    return {
      version,
      buildNumber,
      isBeta,
      variant: envVariant,
    };
  }

  async checkForUpdate(): Promise<UpdateCheckResult> {
    try {
      // 1. Try native Firebase App Distribution check if native module exists
      const FirebaseAppDistributionModule = NativeModules.RNFirebaseAppDistribution;
      if (FirebaseAppDistributionModule && typeof FirebaseAppDistributionModule.checkForUpdate === 'function') {
        const updateInfo = await FirebaseAppDistributionModule.checkForUpdate();
        if (updateInfo?.isUpdateAvailable) {
          return {
            updateAvailable: true,
            latestVersion: updateInfo?.latestVersion || undefined,
            releaseNotes: updateInfo?.releaseNotes || undefined,
            isMandatory: Boolean(updateInfo?.isMandatory),
            downloadUrl: updateInfo?.downloadUrl || undefined,
          };
        }
      }

      // 2. Fallback check against GitHub Releases API
      const currentVersion = Constants.expoConfig?.version || Application.nativeApplicationVersion || '0.3.0';
      const response = await fetch('https://api.github.com/repos/Edgeoft/sewalo-mobile-Frontend/releases/latest', {
        headers: { Accept: 'application/vnd.github.v3+json' },
      });

      if (response.ok) {
        const releaseData = await response.json();
        const rawTag = releaseData.tag_name || '';
        const latestVersion = rawTag.replace(/^v/, '');
        const apkAsset = releaseData.assets?.find(
          (a: { name?: string; browser_download_url?: string }) =>
            a.name?.endsWith('.apk') || a.name?.includes('app-release'),
        );
        const downloadUrl =
          apkAsset?.browser_download_url || releaseData.html_url || 'https://appdistribution.firebase.google.com';

        if (latestVersion && this.isVersionGreater(latestVersion, currentVersion)) {
          return {
            updateAvailable: true,
            latestVersion,
            releaseNotes: releaseData.body || 'A new build is available with performance updates and improvements.',
            isMandatory: false,
            downloadUrl,
          };
        }
      }

      return {
        updateAvailable: false,
      };
    } catch (error) {
      console.warn('[FirebaseDistributionProvider] Check for updates failed:', error);
      return { updateAvailable: false };
    }
  }

  isFeedbackSupported(): boolean {
    return true;
  }

  async startTesterFeedback(): Promise<boolean> {
    try {
      // 1. Try native Firebase App Distribution feedback module if compiled into build
      const FirebaseAppDistributionModule = NativeModules.RNFirebaseAppDistribution;
      if (FirebaseAppDistributionModule && typeof FirebaseAppDistributionModule.startFeedback === 'function') {
        await FirebaseAppDistributionModule.startFeedback();
        return true;
      }

      // 2. Direct feedback fallback (opens email prompt to team with diagnostic specs)
      const versionInfo = this.getVersionInfo();
      const subject = encodeURIComponent(
        `[Tester Feedback] Sewalo Mobile (${versionInfo.version} - Build ${versionInfo.buildNumber})`,
      );
      const body = encodeURIComponent(
        `Hi Sewalo Team,\n\nHere is my feedback:\n\n\n\n------------------------------\nDevice OS: ${Platform.OS} (${Platform.Version})\nApp Version: ${versionInfo.version} (Build ${versionInfo.buildNumber})\nEnvironment: ${versionInfo.variant}\nTimestamp: ${new Date().toISOString()}\n------------------------------`,
      );
      const mailtoUrl = `mailto:feedback@sewalo.com?subject=${subject}&body=${body}`;

      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
        return true;
      }

      return false;
    } catch (error) {
      console.warn('[FirebaseDistributionProvider] Start tester feedback failed:', error);
      return false;
    }
  }

  private isVersionGreater(v1: string, v2: string): boolean {
    const p1 = v1.split('.').map((n) => parseInt(n, 10) || 0);
    const p2 = v2.split('.').map((n) => parseInt(n, 10) || 0);
    for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
      const num1 = p1[i] || 0;
      const num2 = p2[i] || 0;
      if (num1 > num2) return true;
      if (num1 < num2) return false;
    }
    return false;
  }
}
