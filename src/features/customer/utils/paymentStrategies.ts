import { Platform, Linking } from 'react-native';
import { PAYMENT_METHODS, type MakePaymentResponse } from '@/types';
import type { SnackbarConfig } from '@/components/ui/Snackbar';

export interface PaymentStrategy {
  process(
    response: MakePaymentResponse,
    showSnackbar: (config: SnackbarConfig) => void,
    t: (key: string) => string,
  ): void | Promise<void>;
}

export class CashPaymentStrategy implements PaymentStrategy {
  process(
    response: MakePaymentResponse,
    showSnackbar: (config: SnackbarConfig) => void,
    t: (key: string) => string,
  ): void {
    if (response.type !== PAYMENT_METHODS.Cash) return;
    showSnackbar({ message: t('customer.paymentCompleted'), type: 'success' });
  }
}

export class EsewaPaymentStrategy implements PaymentStrategy {
  process(
    response: MakePaymentResponse,
    showSnackbar: (config: SnackbarConfig) => void,
    t: (key: string) => string,
  ): void {
    if (response.type !== PAYMENT_METHODS.Esewa) return;
    const { payment } = response;
    const fields = {
      amount: payment.amount.toString(),
      tax_amount: payment.tax_amount.toString(),
      total_amount: payment.total_amount.toString(),
      transaction_uuid: payment.transaction_uuid,
      product_code: payment.product_code,
      product_service_charge: payment.product_service_charge.toString(),
      product_delivery_charge: payment.product_delivery_charge.toString(),
      success_url: payment.success_url,
      failure_url: payment.failure_url,
      signed_field_names: payment.signed_field_names,
      signature: payment.signature,
    };

    // Platform conditional redirection:
    // - On Web ('web'), we submit the form payload via native DOM APIs.
    // - On iOS/Android, native runtime lacks DOM support (document is undefined). We redirect to the payment URL with query string parameters instead.
    if (Platform.OS === 'web') {
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = payment.api_endpoint;
      Object.entries(fields).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
    } else {
      const queryParams = Object.entries(fields)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
      const paymentUrl = `${payment.api_endpoint}?${queryParams}`;
      Linking.openURL(paymentUrl).catch((err) => {
        console.error('Failed to open payment URL', err);
        showSnackbar({ message: t('customer.failedToOpenPayment') || 'Failed to redirect to payment', type: 'error' });
      });
    }
  }
}

export class PaymentFactory {
  static get(type: 'cash' | 'esewa'): PaymentStrategy {
    switch (type) {
      case PAYMENT_METHODS.Cash:
        return new CashPaymentStrategy();
      case PAYMENT_METHODS.Esewa:
        return new EsewaPaymentStrategy();
      default:
        throw new Error(`Unsupported payment method: ${type}`);
    }
  }
}
