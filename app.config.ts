import { ExpoConfig, ConfigContext } from 'expo/config';
import { execSync } from 'child_process';
import packageJson from './package.json';

/**
 * Calculates monotonic build number based on total git commit count.
 * Safe fallback to 1 if git command is unavailable or fails.
 */
function getGitCommitCount(): number {
  try {
    const stdout = execSync('git rev-list --count HEAD', { stdio: ['ignore', 'pipe', 'ignore'] });
    const count = parseInt(stdout.toString().trim(), 10);
    return isNaN(count) || count <= 0 ? 1 : count;
  } catch {
    return 1;
  }
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const env = (process.env.EXPO_PUBLIC_ENV || process.env.APP_ENV || 'dev').toLowerCase();
  const isProd = env === 'prod' || env === 'production';

  const rawBuildNumber = process.env.BUILD_NUMBER ? parseInt(process.env.BUILD_NUMBER, 10) : getGitCommitCount();
  const buildNumber = isNaN(rawBuildNumber) || rawBuildNumber <= 0 ? 1 : rawBuildNumber;

  const baseVersion = process.env.APP_VERSION || packageJson.version || '0.1.0';

  // Environment-to-Version Rule:
  // dev/staging -> vX.Y.Z-beta.BUILD_NUMBER (e.g. 0.1.0-beta.12)
  // prod/production -> Clean proper release number (e.g. 1.0.0)
  const dynamicVersion = isProd ? baseVersion : `${baseVersion}-beta.${buildNumber}`;

  return {
    ...config,
    name: 'Sewalo',
    slug: 'sewalo-mobile',
    version: dynamicVersion,
    orientation: 'portrait',
    icon: './assets/app_icons/ios_icon.png',
    scheme: 'sewalomobilefrontend',
    userInterfaceStyle: 'automatic',
    ios: {
      bundleIdentifier: 'com.edgeoft.sewalo',
      buildNumber: String(buildNumber),
      icon: './assets/app_icons/ios_icon.png',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/app_icons/android_adaptive_foreground.png',
        backgroundColor: '#485aff',
      },
      icon: './assets/app_icons/ios_icon.png',
      predictiveBackGestureEnabled: false,
      package: 'com.edgeoft.sewalo',
      versionCode: buildNumber,
    },
    web: {
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          backgroundColor: '#485aff',
          image: './assets/sewalo_logo.png',
          imageWidth: 180,
          resizeMode: 'contain',
        },
      ],
      'expo-font',
      'expo-sharing',
      [
        'expo-notifications',
        {
          icon: './assets/app_icons/android_adaptive_foreground.png',
          color: '#485aff',
        },
      ],
      'expo-localization',
      'expo-image',
      'expo-web-browser',
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: '28882928-ab96-41e0-946a-9c74cd29f288',
      },
      envVariant: isProd ? 'production' : 'beta',
      buildNumber: buildNumber,
    },
  };
};
