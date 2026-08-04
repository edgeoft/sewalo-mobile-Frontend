import { z } from 'zod';
import { FINANCE_ACCOUNT_TYPE } from '@/types';

export const getFinanceAccountSchema = (t: (key: string) => string) =>
  z.object({
    type: z.nativeEnum(FINANCE_ACCOUNT_TYPE),
    name: z.string().min(1, { message: t('validation.bankNameRequired') }),
    account_holder_name: z.string().min(1, { message: t('validation.accountHolderRequired') }),
    account_no: z.string().min(4, { message: t('validation.accountNoRequired') }),
    is_default: z.boolean().optional(),
  });

export const financeAccountSchema = getFinanceAccountSchema((key) => {
  const defaults: Record<string, string> = {
    'validation.bankNameRequired': 'Bank or Wallet name is required',
    'validation.accountHolderRequired': 'Account holder name is required',
    'validation.accountNoRequired': 'Account number/Mobile number is required',
  };
  return defaults[key] || key;
});

export type FinanceAccountFormValues = z.infer<typeof financeAccountSchema>;
