import React from 'react';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Input } from '@/components/ui';
import SelectSheet, { SelectOptionItem } from '@/components/ui/SelectSheet';

import { FINANCE_ACCOUNT_TYPE, FinanceAccountType } from '@/types';
import { NEPAL_BANKS, DIGITAL_WALLETS } from '../constants/finance';
import { FinanceAccountFormValues } from '@/schemas/provider';

interface FinancialAccountFormProps {
  control: Control<FinanceAccountFormValues>;
  errors: FieldErrors<FinanceAccountFormValues>;
}

const BANK_OPTIONS: SelectOptionItem[] = NEPAL_BANKS.map((bank) => ({
  value: bank,
  label: bank,
}));

const WALLET_OPTIONS: SelectOptionItem[] = DIGITAL_WALLETS.map((wallet) => ({
  value: wallet,
  label: wallet,
}));

export default function FinancialAccountForm({ control, errors }: FinancialAccountFormProps) {
  const { t } = useTranslation();
  const TYPE_OPTIONS: SelectOptionItem[] = [
    { value: FINANCE_ACCOUNT_TYPE.Bank, label: t('provider.bankAccount') },
    { value: FINANCE_ACCOUNT_TYPE.DigitalWallet, label: t('provider.digitalWallet') },
  ];
  return (
    <View className="gap-y-4">
      {/* Type */}
      <Controller
        control={control}
        name="type"
        render={({ field: { onChange, value } }) => (
          <SelectSheet
            label={t('provider.accountType')}
            options={TYPE_OPTIONS}
            value={value}
            onSelect={(val) => onChange(val as FinanceAccountType)}
            placeholder={t('provider.selectAccountType')}
            title={t('provider.accountType')}
            description={t('provider.accountTypeDesc')}
            error={errors.type?.message as string}
          />
        )}
      />

      <Controller
        control={control}
        name="type"
        render={({ field: { value: currentType } }) => {
          const isWallet = currentType === FINANCE_ACCOUNT_TYPE.DigitalWallet;
          const nameOptions = isWallet ? WALLET_OPTIONS : BANK_OPTIONS;
          const nameLabel = isWallet ? 'Wallet Name *' : 'Bank Name *';
          const namePlaceholder = isWallet ? 'Select Digital Wallet' : 'Select Bank';

          return (
            <View className="gap-y-4">
              {/* Name (Bank or Wallet Name) */}
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, value: nameValue } }) => (
                  <SelectSheet
                    label={nameLabel}
                    options={nameOptions}
                    value={nameValue}
                    onSelect={onChange}
                    placeholder={namePlaceholder}
                    title={isWallet ? 'Select Wallet' : 'Select Bank'}
                    disabled={!currentType}
                    error={errors.name?.message as string}
                  />
                )}
              />

              {/* Account Holder Name */}
              <Controller
                control={control}
                name="account_holder_name"
                render={({ field: { onChange, onBlur, value: holderValue } }) => (
                  <Input
                    label="Account Holder Name *"
                    placeholder="Enter full name"
                    value={holderValue}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.account_holder_name?.message as string}
                  />
                )}
              />

              {/* Account / Mobile Number */}
              <Controller
                control={control}
                name="account_no"
                render={({ field: { onChange, onBlur, value: numberValue } }) => (
                  <Input
                    label={isWallet ? 'Mobile Number *' : 'Account Number *'}
                    placeholder={isWallet ? 'Enter 10-digit mobile number' : 'Enter account number'}
                    value={numberValue}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="numeric"
                    error={errors.account_no?.message as string}
                  />
                )}
              />
            </View>
          );
        }}
      />
    </View>
  );
}
