import { Platform, Linking } from 'react-native';
import { PAYMENT_METHODS, type MakePaymentResponse, type PaymentMethod } from '@/types';
import type { SnackbarConfig } from '@/components/ui/Snackbar';

export interface PaymentHandlerParams {
  response: MakePaymentResponse;
  showSnackbar: (config: SnackbarConfig) => void;
  t: (key: string) => string;
}

export type PaymentHandler = (params: PaymentHandlerParams) => void | Promise<void>;

const handleCashPayment = ({ showSnackbar, t }: PaymentHandlerParams) => {
  showSnackbar({ message: t('customer.paymentCompleted'), type: 'success' });
};

const handleEsewaPayment = ({ response, showSnackbar, t }: PaymentHandlerParams) => {
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
};

export const PAYMENT_HANDLERS: Record<PaymentMethod, PaymentHandler> = {
  [PAYMENT_METHODS.Cash]: handleCashPayment,
  [PAYMENT_METHODS.Esewa]: handleEsewaPayment,
};

export function processPaymentResponse(method: PaymentMethod, params: PaymentHandlerParams): void | Promise<void> {
  const handler = PAYMENT_HANDLERS[method];
  if (!handler) {
    throw new Error(`Unsupported payment method: ${method}`);
  }
  return handler(params);
}

// Backward compatibility alias for migration
export const PaymentFactory = {
  get: (type: PaymentMethod) => ({
    process: (
      response: MakePaymentResponse,
      showSnackbar: (config: SnackbarConfig) => void,
      t: (key: string) => string,
    ) => processPaymentResponse(type, { response, showSnackbar, t }),
  }),
};
