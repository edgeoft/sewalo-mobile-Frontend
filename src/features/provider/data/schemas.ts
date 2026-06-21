import { z } from 'zod';
import { FinanceAccountType } from '../api/types/finance';

export const financeAccountSchema = z.object({
  type: z.nativeEnum(FinanceAccountType),
  name: z.string().min(1, { message: 'Bank or Wallet name is required' }),
  account_holder_name: z.string().min(1, { message: 'Account holder name is required' }),
  account_no: z.string().min(4, { message: 'Account number/Mobile number is required' }),
  is_default: z.boolean().optional(),
});

export type FinanceAccountFormValues = z.infer<typeof financeAccountSchema>;
