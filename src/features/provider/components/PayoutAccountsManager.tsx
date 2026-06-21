import React, { useState } from 'react';
import { View, Text, Alert, Pressable, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
import { Feather } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';

import Button from '@/components/ui/Button';
import { Skeleton } from '@/components/ui';

import FinancialAccountForm from './FinancialAccountForm';
import { financeAccountSchema, FinanceAccountFormValues } from '../data/schemas';
import { FinanceAccountType, FinanceAccount } from '../api/types/finance';
import {
  useCreateFinanceAccount,
  useDeleteFinanceAccount,
  useGetFinanceAccountsQuery,
  useUpdateFinanceAccount,
} from '../api/hooks/finance';

const cardShadow = {
  shadowColor: '#0f172a',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.03,
  shadowRadius: 8,
  elevation: 1,
};

const AccountSkeleton = () => (
  <View style={cardShadow} className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
    <View className="flex-row items-center">
      <Skeleton className="h-11 w-11 rounded-lg mr-3" />
      <View className="flex-1 gap-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
      </View>
    </View>
  </View>
);

interface PayoutAccountsManagerProps {
  header?: React.ReactNode;
}

export default function PayoutAccountsManager({ header }: PayoutAccountsManagerProps) {
  const insets = useSafeAreaInsets();
  const [showAddForm, setShowAddForm] = useState(false);

  const queryClient = useQueryClient();
  const { data: accountsResponse, isLoading } = useGetFinanceAccountsQuery();
  const { mutate: createAccount, isPending: isCreating } = useCreateFinanceAccount();
  const { mutate: updateAccount, isPending: isUpdating } = useUpdateFinanceAccount();
  const { mutate: deleteAccount, isPending: isDeleting } = useDeleteFinanceAccount();

  const isMutating = isUpdating || isDeleting;

  const accounts: FinanceAccount[] = accountsResponse?.data || [];
  const banks = accounts.filter((a: FinanceAccount) => a.type === FinanceAccountType.BANK);
  const wallets = accounts.filter((a: FinanceAccount) => a.type === FinanceAccountType.DIGITAL_WALLET);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FinanceAccountFormValues>({
    resolver: zodResolver(financeAccountSchema),
    defaultValues: {
      type: FinanceAccountType.BANK,
      name: '',
      account_holder_name: '',
      account_no: '',
    },
  });

  const handleSetPrimary = (id: number) => {
    updateAccount(
      { id, is_default: true },
      {
        onSuccess: () => {
          return queryClient.invalidateQueries({ queryKey: ['financeAccounts'] }).then(() => {
            Alert.alert('Success', 'Account set as your primary payout method.');
          });
        },
      },
    );
  };

  const handleRemove = (id: number) => {
    Alert.alert('Remove Account', 'Are you sure you want to remove this account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          deleteAccount(id, {
            onSuccess: () => {
              return queryClient.invalidateQueries({ queryKey: ['financeAccounts'] });
            },
          });
        },
      },
    ]);
  };

  const handleAddSubmit = (formData: FinanceAccountFormValues) => {
    createAccount(
      {
        type: formData.type,
        name: formData.name,
        account_holder_name: formData.account_holder_name,
        account_no: formData.account_no,
        is_default: accounts.length === 0, // Make primary if it's the first account
      },
      {
        onSuccess: () => {
          return queryClient.invalidateQueries({ queryKey: ['financeAccounts'] }).then(() => {
            setShowAddForm(false);
            reset();
            Alert.alert('Success', 'Account added successfully!');
          });
        },
      },
    );
  };

  return (
    <View className="flex-1">
      <View className="flex-row items-start justify-between mb-6">
        <View className="flex-1">{header}</View>
        <Pressable
          onPress={() => setShowAddForm(true)}
          className="flex-row items-center active:opacity-60 bg-primary/10 px-3 py-2 rounded-xl mt-1"
        >
          <Feather name="plus" size={16} color="#485aff" />
          <Text className="text-sm font-sans-bold text-primary ml-1.5">Add</Text>
        </Pressable>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showAddForm}
        onRequestClose={() => {
          if (isCreating) return;
          setShowAddForm(false);
          reset();
        }}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <Pressable
            style={{ flex: 1 }}
            onPress={() => {
              if (!isCreating) {
                setShowAddForm(false);
                reset();
              }
            }}
          />

          <View
            className="bg-white rounded-t-3xl px-6 pt-5 shadow-2xl"
            style={{ paddingBottom: Math.max(insets.bottom, 24), maxHeight: '85%' }}
          >
            <View className="w-12 h-1.5 bg-gray-200 rounded-full self-center mb-6" />

            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-sans-extrabold text-gray-900">Add New Account</Text>
              <Pressable
                disabled={isCreating}
                onPress={() => {
                  setShowAddForm(false);
                  reset();
                }}
                className="p-2 bg-gray-50 rounded-full"
              >
                <Feather name="x" size={20} color="#64748b" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              <FinancialAccountForm control={control} errors={errors} />

              <View className="mt-8 mb-4">
                <Button
                  title={isCreating ? 'Saving...' : 'Save Account'}
                  variant="primary"
                  disabled={isCreating}
                  onPress={handleSubmit(handleAddSubmit)}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Digital Wallets Section */}
      <Text className="text-sm font-sans-bold text-gray-900 mb-3 ml-1">Digital Wallets</Text>
      <View className="gap-y-4 mb-6">
        {isLoading ? (
          <AccountSkeleton />
        ) : wallets.length === 0 ? (
          <View className="bg-white rounded-xl border border-gray-100 p-6 items-center">
            <Text className="text-xs font-sans-medium text-gray-400">No digital wallets linked yet.</Text>
          </View>
        ) : (
          wallets.map((wallet: FinanceAccount) => {
            const isEsewa = wallet.name?.toLowerCase().includes('esewa') || false;
            const brandBg = isEsewa ? 'bg-emerald-50 border-emerald-200' : 'bg-purple-50 border-purple-200';

            return (
              <View key={wallet.id} style={cardShadow} className="bg-white rounded-xl border border-gray-100 p-4">
                <View className="flex-row items-center justify-between">
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
                        <Text className="text-sm font-sans-bold text-gray-900 mr-2">
                          {wallet.name || 'Digital Wallet'}
                        </Text>
                        {wallet.is_default && (
                          <View className="bg-primary/10 px-2 py-0.5 rounded-full">
                            <Text className="text-[9px] font-sans-bold text-primary">Primary</Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-xs font-sans-semibold text-gray-500 mt-0.5">
                        {wallet.account_holder_name}
                      </Text>
                      <Text className="text-xs font-sans-medium text-gray-400 mt-0.5">
                        Mobile: {wallet.account_no || 'N/A'}
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="flex-row justify-end gap-x-2 border-t border-gray-50 mt-4 pt-3">
                  <Pressable
                    onPress={() => handleRemove(wallet.id)}
                    className="px-3 py-1.5 rounded-lg active:bg-red-50"
                  >
                    <Text className="text-xs font-sans-bold text-red-500">Remove</Text>
                  </Pressable>

                  {!wallet.is_default && (
                    <Pressable
                      onPress={() => handleSetPrimary(wallet.id)}
                      className="border border-primary/20 px-3 py-1.5 rounded-lg active:bg-primary/5"
                    >
                      <Text className="text-xs font-sans-bold text-primary">Set Primary</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* Bank Accounts Section */}
      <Text className="text-sm font-sans-bold text-gray-900 mb-3 ml-1">Bank Accounts</Text>
      <View className="gap-y-4 mb-6">
        {isLoading ? (
          <>
            <AccountSkeleton />
            <AccountSkeleton />
          </>
        ) : banks.length === 0 ? (
          <View className="bg-white rounded-xl border border-gray-100 p-6 items-center">
            <Text className="text-xs font-sans-medium text-gray-400">No bank accounts linked yet.</Text>
          </View>
        ) : (
          banks.map((bank: FinanceAccount) => (
            <View key={bank.id} style={cardShadow} className="bg-white rounded-xl border border-gray-100 p-4">
              <View className="flex-row justify-between items-start">
                <View className="flex-row items-center flex-1">
                  <View className="h-10 w-10 rounded-full bg-blue-50 items-center justify-center mr-3 border border-blue-100">
                    <Feather name="home" size={18} color="#1d4ed8" />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text className="text-sm font-sans-bold text-gray-900 mr-2">{bank.name || 'Bank Account'}</Text>
                      {bank.is_default && (
                        <View className="bg-primary/10 px-2 py-0.5 rounded-full">
                          <Text className="text-[9px] font-sans-bold text-primary">Primary</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-xs font-sans-semibold text-gray-500 mt-1">{bank.account_holder_name}</Text>
                    <Text className="text-xs font-sans-bold text-gray-700 mt-0.5">
                      {`•••• •••• •••• ${bank.account_no?.slice(-4) ?? '****'}`}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="flex-row justify-end gap-x-2 border-t border-gray-50 mt-4 pt-3">
                <Pressable onPress={() => handleRemove(bank.id)} className="px-3 py-1.5 rounded-lg active:bg-red-50">
                  <Text className="text-xs font-sans-bold text-red-500">Remove</Text>
                </Pressable>

                {!bank.is_default && (
                  <Pressable
                    onPress={() => handleSetPrimary(bank.id)}
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

      {/* Global Mutation Overlay */}
      {isMutating && (
        <View
          className="absolute inset-0 bg-black/20 items-center justify-center z-50 rounded-xl"
          style={{ margin: -16 }}
        >
          <View className="bg-white p-4 rounded-xl items-center shadow-lg">
            <ActivityIndicator size="large" color="#485aff" />
            <Text className="text-sm font-sans-bold text-gray-800 mt-3">Processing...</Text>
          </View>
        </View>
      )}
    </View>
  );
}
