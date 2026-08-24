import { ExpoConfig, ConfigContext } from 'expo/config';
import packageJson from './package.json';

export default ({ config }: ConfigContext): ExpoConfig => {
  const env = (process.env.EXPO_PUBLIC_ENV || process.env.APP_ENV || 'dev').toLowerCase();
  const isProd = env === 'prod' || env === 'production';

  const buildNumber = Math.max(parseInt(process.env.BUILD_NUMBER || '1', 10) || 1, 1);
  const baseVersion = process.env.APP_VERSION || packageJson.version || '0.1.0';

  // dev/staging → vX.Y.Z-beta.BUILD_NUMBER | prod → vX.Y.Z
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
      googleServicesFile: './android/app/google-services.json',
      versionCode: buildNumber,
    },
    web: {
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      '@react-native-firebase/app',
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
          icon: './assets/notification_icon.png',
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
