const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');
const reactNativeA11y = require('eslint-plugin-react-native-a11y');

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    plugins: {
      'react-native-a11y': reactNativeA11y,
    },
    rules: {
      'react-native-a11y/has-valid-accessibility-actions': 'error',
      'react-native-a11y/has-valid-accessibility-component-type': 'error',
      'react-native-a11y/has-valid-accessibility-live-region': 'error',
      'react-native-a11y/has-valid-accessibility-role': 'error',
      'react-native-a11y/has-valid-accessibility-state': 'error',
      'react-native-a11y/has-valid-accessibility-states': 'error',
      'react-native-a11y/has-valid-accessibility-traits': 'error',
      'react-native-a11y/has-valid-accessibility-value': 'error',
      'react-native-a11y/has-valid-important-for-accessibility': 'error',
      'react-native-a11y/no-nested-touchables': 'error',
    },
  },
  {
    ignores: ['dist/*'],
  },
]);
