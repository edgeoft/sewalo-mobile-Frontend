import React, { useMemo, useRef, useState } from 'react';
import { THEME_COLORS } from '@/constants/colors';
import { Modal, View, Text, Pressable, ActivityIndicator, Platform, StyleSheet, Alert } from 'react-native';
import { WebView, type WebViewNavigation } from 'react-native-webview';
import type { ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import type { EsewaPaymentDetails } from '@/types/bookings';

export interface EsewaPaymentModalProps {
  visible: boolean;
  paymentDetails: EsewaPaymentDetails | null;
  onSuccess: () => void;
  onFailure: (errorMessage?: string) => void;
  onClose: () => void;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export default function EsewaPaymentModal({
  visible,
  paymentDetails,
  onSuccess,
  onFailure,
  onClose,
}: EsewaPaymentModalProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasHandledResult = useRef(false);

  // Reset handled flag whenever modal opens
  React.useEffect(() => {
    if (visible) {
      hasHandledResult.current = false;
    }
  }, [visible]);

  // Memoized so loading-state re-renders never rebuild the html (which reloads the WebView).
  const htmlContent = useMemo(() => {
    if (!paymentDetails) return '';

    const fields: Record<string, string> = {
      amount: paymentDetails.amount.toString(),
      tax_amount: paymentDetails.tax_amount.toString(),
      total_amount: paymentDetails.total_amount.toString(),
      transaction_uuid: paymentDetails.transaction_uuid,
      product_code: paymentDetails.product_code,
      product_service_charge: paymentDetails.product_service_charge.toString(),
      product_delivery_charge: paymentDetails.product_delivery_charge.toString(),
      success_url: paymentDetails.success_url,
      failure_url: paymentDetails.failure_url,
      signed_field_names: paymentDetails.signed_field_names,
      signature: paymentDetails.signature,
    };

    const formInputs = Object.entries(fields)
      .map(([key, value]) => `      <input type="hidden" name="${escapeHtml(key)}" value="${escapeHtml(value)}" />`)
      .join('\n');

    return `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100vh;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        background-color: #f8fafc;
        color: #1e293b;
      }
      .spinner {
        border: 3.5px solid rgba(72, 90, 255, 0.15);
        border-top: 3.5px solid #485aff;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 0.8s linear infinite;
        margin-bottom: 16px;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .title {
        font-size: 15px;
        font-weight: 600;
        color: #1e293b;
      }
      .subtitle {
        font-size: 12px;
        color: #64748b;
        margin-top: 4px;
      }
    </style>
  </head>
  <body>
    <div class="spinner"></div>
    <div class="title">Connecting to eSewa...</div>
    <div class="subtitle">Please wait while we redirect you to payment</div>
    <form id="esewa_post_form" method="POST" action="${escapeHtml(paymentDetails.api_endpoint)}">
${formInputs}
    </form>
    <script>
      document.getElementById('esewa_post_form').submit();
    </script>
  </body>
</html>
  `;
  }, [paymentDetails]);

  if (!visible || !paymentDetails || !htmlContent) {
    return null;
  }

  const handleConfirmClose = () => {
    Alert.alert(
      t('customer.cancelPaymentTitle', 'Cancel Payment'),
      t('customer.cancelPaymentConfirm', 'Are you sure you want to cancel this payment?'),
      [
        { text: t('common.no', 'No'), style: 'cancel' },
        {
          text: t('common.yes', 'Yes'),
          style: 'destructive',
          onPress: () => {
            onClose();
          },
        },
      ],
    );
  };

  const processUrl = (url: string): boolean => {
    if (hasHandledResult.current || !url) return false;

    // Check for success URL patterns
    if (
      url.includes('success=payment_successful') ||
      url.includes('success=true') ||
      url.includes('/payment/success')
    ) {
      hasHandledResult.current = true;
      onSuccess();
      return true;
    }

    // Check for failure / cancellation URL patterns
    if (url.includes('payment=failed') || url.includes('error=') || url.includes('/payment/failure')) {
      hasHandledResult.current = true;
      let errorMsg: string | undefined;
      try {
        const match = url.match(/[?&]error=([^&]+)/);
        if (match && match[1]) {
          errorMsg = decodeURIComponent(match[1]);
        }
      } catch {
        // ignore
      }
      onFailure(errorMsg);
      return true;
    }

    return false;
  };

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    if (processUrl(navState.url)) {
      return;
    }
    setIsLoading(navState.loading);
  };

  const handleShouldStartLoad = (event: ShouldStartLoadRequest): boolean => {
    const { url } = event;
    if (processUrl(url)) {
      return false;
    }
    return true;
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleConfirmClose}>
      <View style={[styles.container, { paddingTop: Platform.OS === 'ios' ? insets.top : 0 }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <View style={styles.lockBadge}>
              <Feather name="lock" size={13} color="#10b981" />
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.headerTitle}>{t('customer.esewaPayment', 'eSewa Payment')}</Text>
              <Text style={styles.headerSubtitle}>Rs. {paymentDetails.total_amount.toLocaleString()}</Text>
            </View>
          </View>
          <Pressable
            onPress={handleConfirmClose}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('common.close', 'Close')}
            style={styles.closeButton}
          >
            <Feather name="x" size={20} color="#64748b" />
          </Pressable>
        </View>

        {/* Progress Bar / Loader */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={THEME_COLORS.primary} />
            <Text style={styles.loadingText}>{t('common.loading', 'Loading payment gateway...')}</Text>
          </View>
        )}

        {/* WebView */}
        <View style={styles.webViewWrapper}>
          <WebView
            ref={webViewRef}
            source={{ html: htmlContent }}
            originWhitelist={['*']}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            mixedContentMode="always"
            onNavigationStateChange={handleNavigationStateChange}
            onShouldStartLoadWithRequest={handleShouldStartLoad}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
            renderLoading={() => (
              <View style={styles.webViewLoader}>
                <ActivityIndicator size="large" color={THEME_COLORS.primary} />
              </View>
            )}
            style={styles.webView}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#ffffff',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lockBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  titleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: THEME_COLORS.primary,
    marginTop: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  webViewWrapper: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  webView: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  webViewLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
