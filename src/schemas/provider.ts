import { z } from 'zod';
import { FINANCE_ACCOUNT_TYPE } from '@/types';

export const financeAccountSchema = z.object({
  type: z.nativeEnum(FINANCE_ACCOUNT_TYPE),
  name: z.string().min(1, { message: 'Bank or Wallet name is required' }),
  account_holder_name: z.string().min(1, { message: 'Account holder name is required' }),
  account_no: z.string().min(4, { message: 'Account number/Mobile number is required' }),
  is_default: z.boolean().optional(),
});

export type FinanceAccountFormValues = z.infer<typeof financeAccountSchema>;
