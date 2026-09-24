import { forwardRef } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { WebView, WebViewProps, type WebViewMessageEvent } from 'react-native-webview';
import { MAP_USER_AGENT } from './mapShared';

export interface SharedWebViewMapProps extends Omit<WebViewProps, 'source'> {
  html: string;
  containerStyle?: ViewStyle;
}

export const SharedWebViewMap = forwardRef<WebView, SharedWebViewMapProps>(
  ({ html, containerStyle, onMessage, style, ...props }, ref) => {
    const handleMessage = (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === 'log') {
          console.log('[Map WebView Console]', data.message);
          return;
        }
      } catch {
        // ignore parse errors for messages that are not internal logging
      }
      if (onMessage) {
        onMessage(event);
      }
    };

    return (
      <View style={[styles.container, containerStyle]}>
        <WebView
          ref={ref}
          originWhitelist={['*']}
          source={{ html }}
          onMessage={handleMessage}
          style={[styles.map, style]}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          userAgent={MAP_USER_AGENT}
          {...props}
        />
      </View>
    );
  },
);

SharedWebViewMap.displayName = 'SharedWebViewMap';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFill,
  },
});
