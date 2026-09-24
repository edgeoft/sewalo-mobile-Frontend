import type React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { WebView, type WebViewProps, type WebViewMessageEvent } from 'react-native-webview';
import { MAP_USER_AGENT } from './mapShared';

export interface SharedWebViewMapProps extends Omit<WebViewProps, 'source'> {
  html: string;
  containerStyle?: ViewStyle;
  ref?: React.Ref<WebView>;
}

export function SharedWebViewMap({ html, containerStyle, onMessage, style, ref, ...props }: SharedWebViewMapProps) {
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFill,
  },
});
