export enum FinanceAccountType {
  BANK = 'bank',
  DIGITAL_WALLET = 'wallet',
}

export interface FinanceAccount {
  id: number;
  user_id: string;
  name: string;
  account_holder_name: string;
  account_no: string;
  type: FinanceAccountType;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateFinanceAccountPayload {
  name: string;
  account_holder_name: string;
  account_no: string;
  type: FinanceAccountType;
  is_default?: boolean;
}

export interface UpdateFinanceAccountPayload extends Partial<CreateFinanceAccountPayload> {
  id: number;
}

export interface GetFinanceAccountsResponse {
  current_page: number;
  data: FinanceAccount[];
  total: number;
}
