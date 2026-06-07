import React, { useState } from 'react';
import { View, Text, Alert, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Controller, useForm } from 'react-hook-form';
import { Feather } from '@expo/vector-icons';

import Header from '@/components/navigation/Header';
import ContentLayout from '@/components/layout/ContentLayout';
import { SectionHeader } from '@/components/common';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface BankAccount {
  id: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  branch: string;
  isPrimary: boolean;
}

interface WalletAccount {
  id: string;
  provider: 'esewa' | 'khalti';
  mobileNumber: string;
  isPrimary: boolean;
  linked: boolean;
}

const INITIAL_BANKS: BankAccount[] = [
  {
    id: 'bank-1',
    bankName: 'Nepal Investment Mega Bank',
    accountHolder: 'Pepper Potts',
    accountNumber: '•••• •••• •••• 4829',
    branch: 'Durbar Marg, Kathmandu',
    isPrimary: false,
  },
];

const INITIAL_WALLETS: WalletAccount[] = [
  {
    id: 'wallet-1',
    provider: 'esewa',
    mobileNumber: '9802117361',
    isPrimary: true,
    linked: true,
  },
  {
    id: 'wallet-2',
    provider: 'khalti',
    mobileNumber: '',
    isPrimary: false,
    linked: false,
  },
];

interface AddBankFormData {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  branch: string;
}

let bankIdCounter = 0;

export default function PayoutAccountsScreen() {
  const insets = useSafeAreaInsets();

  const [banks, setBanks] = useState<BankAccount[]>(INITIAL_BANKS);
  const [wallets, setWallets] = useState<WalletAccount[]>(INITIAL_WALLETS);
  const [showAddForm, setShowAddForm] = useState(false);
  const [walletLoading, setWalletLoading] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddBankFormData>({
    defaultValues: {
      bankName: '',
      accountHolder: '',
      accountNumber: '',
      branch: '',
    },
  });

  const handleLinkWallet = (walletId: string, provider: string) => {
    Alert.prompt(
      `Link ${provider === 'esewa' ? 'eSewa' : 'Khalti'}`,
      `Enter your 10-digit ${provider === 'esewa' ? 'eSewa' : 'Khalti'} mobile number:`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Link',
          onPress: (number?: string) => {
            if (!number || number.length < 10) {
              Alert.alert('Error', 'Please enter a valid 10-digit mobile number.');
              return;
            }
            setWalletLoading(walletId);
            setTimeout(() => {
              setWallets((prev) =>
                prev.map((w) => (w.id === walletId ? { ...w, linked: true, mobileNumber: number } : w)),
              );
              setWalletLoading(null);
              Alert.alert('Success', `${provider === 'esewa' ? 'eSewa' : 'Khalti'} linked successfully!`);
            }, 1200);
          },
        },
      ],
      'plain-text',
      '',
    );
  };

  const handleSetPrimaryBank = (bankId: string) => {
    setBanks((prev) => prev.map((b) => ({ ...b, isPrimary: b.id === bankId })));
    setWallets((prev) => prev.map((w) => ({ ...w, isPrimary: false })));
    Alert.alert('Success', 'Bank account set as your primary payout method.');
  };

  const handleSetPrimaryWallet = (walletId: string) => {
    setWallets((prev) => prev.map((w) => ({ ...w, isPrimary: w.id === walletId })));
    setBanks((prev) => prev.map((b) => ({ ...b, isPrimary: false })));
    Alert.alert('Success', 'Digital wallet set as your primary payout method.');
  };

  const handleRemoveBank = (bankId: string) => {
    Alert.alert('Remove Bank Account', 'Are you sure you want to remove this bank account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          setBanks((prev) => prev.filter((b) => b.id !== bankId));
        },
      },
    ]);
  };

  const handleAddBankSubmit = (data: AddBankFormData) => {
    const newBank: BankAccount = {
      id: `bank-${++bankIdCounter}`,
      bankName: data.bankName,
      accountHolder: data.accountHolder,
      accountNumber: `•••• •••• •••• ${data.accountNumber.slice(-4)}`,
      branch: data.branch,
      isPrimary: banks.length === 0 && wallets.every((w) => !w.isPrimary),
    };

    setBanks((prev) => [...prev, newBank]);
    setShowAddForm(false);
    reset();
    Alert.alert('Success', 'Bank account added successfully!');
  };

  const cardShadow = {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  };

  return (
    <View className="flex-1 bg-secondary">
      <Header variant="menu" showBackButton={true} showNotifications={false} />

      <ContentLayout
        scrollable
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: 20,
          paddingBottom: Math.max(insets.bottom, 24),
        }}
      >
        <SectionHeader
          title="Payout Accounts"
          description="Manage your bank accounts and digital wallets for service payout transfers."
          className="mb-6"
          titleClassName="text-2xl text-gray-950 font-sans-extrabold"
        />

        {/* Digital Wallets Section */}
        <Text className="text-sm font-sans-bold text-gray-900 mb-3 ml-1">Digital Wallets</Text>
        <View className="gap-y-4 mb-6">
          {wallets.map((wallet) => {
            const isEsewa = wallet.provider === 'esewa';
            const brandBg = isEsewa ? 'bg-emerald-50 border-emerald-200' : 'bg-purple-50 border-purple-200';
            const labelText = isEsewa ? 'eSewa Wallet' : 'Khalti Wallet';

            return (
              <View
                key={wallet.id}
                style={cardShadow}
                className={`bg-white rounded-xl border border-gray-100 p-4 flex-row items-center justify-between`}
              >
                <View className="flex-row items-center flex-1">
                  <View className={`h-11 w-11 rounded-lg items-center justify-center mr-3 border ${brandBg}`}>
                    <Feather
                      name={isEsewa ? 'smartphone' : 'phone'}
                      size={20}
                      color={isEsewa ? '#10b981' : '#8b5cf6'}
                    />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text className="text-sm font-sans-bold text-gray-900 mr-2">{labelText}</Text>
                      {wallet.linked && wallet.isPrimary && (
                        <View className="bg-primary/10 px-2 py-0.5 rounded-full">
                          <Text className="text-[9px] font-sans-bold text-primary">Primary</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-xs font-sans-medium text-gray-400 mt-0.5">
                      {wallet.linked ? `Linked ID: ${wallet.mobileNumber}` : 'Not Linked'}
                    </Text>
                  </View>
                </View>

                {wallet.linked ? (
                  !wallet.isPrimary && (
                    <Pressable
                      onPress={() => handleSetPrimaryWallet(wallet.id)}
                      className="border border-primary/20 px-3 py-1.5 rounded-lg active:bg-primary/5"
                    >
                      <Text className="text-xs font-sans-bold text-primary">Set Primary</Text>
                    </Pressable>
                  )
                ) : (
                  <Pressable
                    disabled={walletLoading === wallet.id}
                    onPress={() => handleLinkWallet(wallet.id, wallet.provider)}
                    className="bg-primary px-3 py-1.5 rounded-lg active:opacity-90"
                  >
                    <Text className="text-xs font-sans-bold text-white">
                      {walletLoading === wallet.id ? 'Linking...' : 'Link'}
                    </Text>
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>

        {/* Bank Accounts Section */}
        <View className="flex-row items-center justify-between mb-3 ml-1">
          <Text className="text-sm font-sans-bold text-gray-900">Bank Accounts</Text>
          {!showAddForm && (
            <Pressable onPress={() => setShowAddForm(true)} className="flex-row items-center active:opacity-60">
              <Feather name="plus" size={14} color="#485aff" />
              <Text className="text-xs font-sans-bold text-primary ml-1">Add Bank</Text>
            </Pressable>
          )}
        </View>

        {showAddForm ? (
          <View style={cardShadow} className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
            <View className="flex-row items-center justify-between mb-4 pb-2 border-b border-gray-50">
              <Text className="text-xs font-sans-bold text-gray-900">Add Bank Account</Text>
              <Pressable onPress={() => setShowAddForm(false)}>
                <Feather name="x" size={16} color="#64748b" />
              </Pressable>
            </View>

            <Controller
              control={control}
              name="bankName"
              rules={{ required: 'Bank name is required' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Bank Name"
                  placeholder="e.g. Nepal Investment Mega Bank"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  className="mb-3"
                  error={errors.bankName?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="accountHolder"
              rules={{ required: 'Account holder name is required' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Account Holder Name"
                  placeholder="e.g. Pepper Potts"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  className="mb-3"
                  error={errors.accountHolder?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="accountNumber"
              rules={{ required: 'Account number is required' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Account Number"
                  placeholder="e.g. 1029384756102"
                  keyboardType="number-pad"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  className="mb-3"
                  error={errors.accountNumber?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="branch"
              rules={{ required: 'Branch name is required' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Branch Name"
                  placeholder="e.g. Durbar Marg Branch"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  className="mb-4"
                  error={errors.branch?.message}
                />
              )}
            />

            <View className="flex-row gap-x-3">
              <Button
                title="Cancel"
                variant="outline"
                className="flex-1 border-gray-200"
                textClassName="text-gray-500"
                onPress={() => {
                  setShowAddForm(false);
                  reset();
                }}
              />
              <Button
                title="Add Bank"
                variant="primary"
                className="flex-1"
                onPress={handleSubmit(handleAddBankSubmit)}
              />
            </View>
          </View>
        ) : (
          <View className="gap-y-4 mb-6">
            {banks.length === 0 ? (
              <View className="bg-white rounded-xl border border-gray-100 p-6 items-center">
                <Text className="text-xs font-sans-medium text-gray-400">No bank accounts linked yet.</Text>
              </View>
            ) : (
              banks.map((bank) => (
                <View key={bank.id} style={cardShadow} className="bg-white rounded-xl border border-gray-100 p-4">
                  <View className="flex-row justify-between items-start">
                    <View className="flex-row items-center flex-1">
                      <View className="h-10 w-10 rounded-full bg-blue-50 items-center justify-center mr-3 border border-blue-100">
                        <Feather name="home" size={18} color="#1d4ed8" />
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-center">
                          <Text className="text-sm font-sans-bold text-gray-900 mr-2">{bank.bankName}</Text>
                          {bank.isPrimary && (
                            <View className="bg-primary/10 px-2 py-0.5 rounded-full">
                              <Text className="text-[9px] font-sans-bold text-primary">Primary</Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-xs font-sans-semibold text-gray-500 mt-1">{bank.accountHolder}</Text>
                        <Text className="text-xs font-sans-bold text-gray-700 mt-0.5">{bank.accountNumber}</Text>
                        <Text className="text-[10px] font-sans-medium text-gray-400 mt-1">Branch: {bank.branch}</Text>
                      </View>
                    </View>
                  </View>

                  <View className="flex-row justify-end gap-x-2 border-t border-gray-50 mt-4 pt-3">
                    <Pressable
                      onPress={() => handleRemoveBank(bank.id)}
                      className="px-3 py-1.5 rounded-lg active:bg-red-50"
                    >
                      <Text className="text-xs font-sans-bold text-red-500">Remove</Text>
                    </Pressable>

                    {!bank.isPrimary && (
                      <Pressable
                        onPress={() => handleSetPrimaryBank(bank.id)}
                        className="border border-primary/20 px-3 py-1.5 rounded-lg active:bg-primary/5"
                      >
                        <Text className="text-xs font-sans-bold text-primary">Set Primary</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ContentLayout>
    </View>
  );
}
