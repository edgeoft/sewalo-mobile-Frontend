import { Platform } from 'react-native';
import { PAYMENT_METHODS, type MakePaymentResponse, type PaymentMethod, type EsewaPaymentDetails } from '@/types';
import type { SnackbarConfig } from '@/components/ui/Snackbar';

export interface PaymentHandlerParams {
  response: MakePaymentResponse;
  showSnackbar: (config: SnackbarConfig) => void;
  t: (key: string) => string;
  onInitiateEsewa?: (payment: EsewaPaymentDetails) => void;
}

export type PaymentHandler = (params: PaymentHandlerParams) => void | Promise<void>;

const handleCashPayment = ({ showSnackbar, t }: PaymentHandlerParams) => {
  showSnackbar({ message: t('customer.paymentCompleted'), type: 'success' });
};

const handleEsewaPayment = ({ response, showSnackbar, t, onInitiateEsewa }: PaymentHandlerParams) => {
  if (response.type !== PAYMENT_METHODS.Esewa) return;
  const { payment } = response;

  if (onInitiateEsewa) {
    onInitiateEsewa(payment);
    return;
  }

  const fields: Record<string, string> = {
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

  if (Platform.OS === 'web' && typeof document !== 'undefined') {
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
    showSnackbar({
      message: t('customer.failedToOpenPayment'),
      type: 'error',
    });
  }
};

export const PAYMENT_HANDLERS: Record<PaymentMethod, PaymentHandler> = {
  [PAYMENT_METHODS.Cash]: handleCashPayment,
  [PAYMENT_METHODS.Esewa]: handleEsewaPayment,
};

export function processPaymentResponse(method: PaymentMethod, params: PaymentHandlerParams): void | Promise<void> {
  return PAYMENT_HANDLERS[method](params);
}
