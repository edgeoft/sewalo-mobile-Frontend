import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { PaginationList, SectionHeader } from '@/components/common';
import ContentLayout from '@/components/layout/ContentLayout';
import Header from '@/components/navigation/Header';
import {
  RECEIVABLE_EARNINGS_MOCK,
  COMMISSIONS_DUE_MOCK,
  type ReceivableEarningItem,
  type CommissionDueItem,
} from '../constants/providerEarnings';

type EarningsTab = 'receivable' | 'commission';
type FilterStatus = 'all' | 'paid' | 'unpaid';

export default function ProviderEarningsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<EarningsTab>('receivable');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  // Hardcoded dashboard overview metrics
  const dashboardStats = {
    totalEarnings: 'Rs. 32,450',
    payableToAdmin: 'Rs. 4,280',
    pendingDispatch: 'Rs. 2,500',
  };

  // Filter Receivable Earnings
  const filteredReceivable = useMemo(() => {
    return RECEIVABLE_EARNINGS_MOCK.filter((item) => {
      if (filterStatus === 'all') return true;
      if (filterStatus === 'paid') return item.status === 'Received';
      if (filterStatus === 'unpaid') return item.status === 'Unpaid';
      return true;
    });
  }, [filterStatus]);

  // Filter Commissions Due
  const filteredCommissions = useMemo(() => {
    return COMMISSIONS_DUE_MOCK.filter((item) => {
      if (filterStatus === 'all') return true;
      if (filterStatus === 'paid') return item.status === 'Paid';
      if (filterStatus === 'unpaid') return item.status === 'Unpaid';
      return true;
    });
  }, [filterStatus]);

  const cardShadow = {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  };

  return (
    <View className="flex-1 bg-secondary">
      <Header variant="menu" showNotifications onNotificationsPress={() => router.push('/notifications')} />

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
          title="Earnings Dashboard"
          description="Monitor your net payouts, commissions due, and incoming dispatches."
          className="mb-5"
          titleClassName="text-2xl"
        />

        {/* Dashboard Financial Summary Cards */}
        <View className="gap-3.5 mb-4">
          {/* Main Net Earnings */}
          <View
            style={cardShadow}
            className="rounded-xl border border-gray-200 bg-white p-4 flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-3.5">
              <View className="h-11 w-11 rounded-xl bg-emerald-50 items-center justify-center">
                <Feather name="trending-up" size={20} color="#059669" />
              </View>
              <View>
                <Text className="text-[10px] font-sans-semibold text-gray-400 uppercase tracking-wider">
                  Total Earnings (Net)
                </Text>
                <Text className="text-xl font-sans-extrabold text-gray-900 mt-0.5">{dashboardStats.totalEarnings}</Text>
              </View>
            </View>
            <View className="rounded-full bg-emerald-50 px-2 py-0.5">
              <Text className="text-[10px] font-sans-bold text-emerald-700">Cleared</Text>
            </View>
          </View>

          {/* Details Row (Payable to Admin & Pending Dispatch) */}
          <View className="flex-row gap-3">
            {/* Payable to Admin */}
            <View
              style={cardShadow}
              className="flex-1 rounded-xl border border-gray-200 bg-white p-3.5 justify-between"
            >
              <View className="flex-row items-center justify-between mb-2">
                <View className="h-9 w-9 rounded-xl bg-red-50 items-center justify-center">
                  <Feather name="arrow-up-right" size={16} color="#dc2626" />
                </View>
                <View className="rounded-full bg-red-50 px-1.5 py-0.5">
                  <Text className="text-[9px] font-sans-bold text-red-700">Admin Fee</Text>
                </View>
              </View>
              <View>
                <Text className="text-[9px] font-sans-semibold text-gray-400 uppercase tracking-wider">
                  Payable to Admin
                </Text>
                <Text className="text-base font-sans-bold text-gray-900 mt-0.5">{dashboardStats.payableToAdmin}</Text>
              </View>
            </View>

            {/* Pending Dispatch */}
            <View
              style={cardShadow}
              className="flex-1 rounded-xl border border-gray-200 bg-white p-3.5 justify-between"
            >
              <View className="flex-row items-center justify-between mb-2">
                <View className="h-9 w-9 rounded-xl bg-blue-50 items-center justify-center">
                  <Feather name="clock" size={16} color="#2563eb" />
                </View>
                <View className="rounded-full bg-blue-50 px-1.5 py-0.5">
                  <Text className="text-[9px] font-sans-bold text-blue-700">Processing</Text>
                </View>
              </View>
              <View>
                <Text className="text-[9px] font-sans-semibold text-gray-400 uppercase tracking-wider">
                  Pending Dispatch
                </Text>
                <Text className="text-base font-sans-bold text-gray-900 mt-0.5">{dashboardStats.pendingDispatch}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Note banner */}
        <View className="flex-row items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50/40 p-3 mb-6">
          <Feather name="info" size={15} color="#4f46e5" />
          <Text className="flex-1 text-[11px] font-sans-semibold text-indigo-700 leading-4">
            A 15% commission is automatically deducted from the gross credited amount for platform fees.
          </Text>
        </View>

        {/* Custom Tab Selection Option */}
        <View style={cardShadow} className="rounded-xl border border-gray-200 bg-white p-1 mb-5">
          <View className="flex-row rounded-lg bg-gray-100 p-0.5">
            <Pressable
              onPress={() => {
                setActiveTab('receivable');
                setFilterStatus('all');
              }}
              className={`flex-1 py-2.5 rounded-md items-center ${
                activeTab === 'receivable' ? 'bg-white shadow-xs' : 'bg-transparent'
              }`}
            >
              <Text
                className={`text-xs font-sans-bold ${activeTab === 'receivable' ? 'text-gray-900' : 'text-gray-500'}`}
              >
                Receivable Earnings
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setActiveTab('commission');
                setFilterStatus('all');
              }}
              className={`flex-1 py-2.5 rounded-md items-center ${
                activeTab === 'commission' ? 'bg-white shadow-xs' : 'bg-transparent'
              }`}
            >
              <Text
                className={`text-xs font-sans-bold ${activeTab === 'commission' ? 'text-gray-900' : 'text-gray-500'}`}
              >
                Commissions Due
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Horizontal Status Filter Pills */}
        <View className="flex-row gap-2 mb-5">
          {(['all', 'paid', 'unpaid'] as const).map((status) => {
            const isActive = filterStatus === status;
            const label =
              status === 'all'
                ? 'All'
                : status === 'paid'
                  ? activeTab === 'receivable'
                    ? 'Received'
                    : 'Paid'
                  : 'Unpaid';

            return (
              <Pressable
                key={status}
                onPress={() => setFilterStatus(status)}
                className={`rounded-full px-4 py-1.5 border ${
                  isActive ? 'bg-primary border-primary' : 'bg-white border-gray-200'
                }`}
              >
                <Text className={`text-[11px] font-sans-bold ${isActive ? 'text-white' : 'text-gray-600'}`}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Transactions List */}
        <View className="flex-1">
          {activeTab === 'receivable' ? (
            <PaginationList
              data={filteredReceivable}
              keyExtractor={(item: ReceivableEarningItem) => item.id}
              pageSize={4}
              emptyTitle="No receivable earnings found"
              emptyDescription="There are no earnings matching the current filter."
              renderItem={(item: ReceivableEarningItem) => (
                <View
                  style={cardShadow}
                  className="rounded-xl border border-gray-200 bg-white p-3.5 flex-row justify-between items-center"
                >
                  <View className="flex-1 mr-3">
                    <Text className="text-xs font-sans-bold text-gray-400 mb-0.5">{item.date}</Text>
                    <Text className="text-sm font-sans-bold text-gray-900" numberOfLines={1}>
                      {item.customerName}
                    </Text>
                    <Text className="text-xs font-sans-medium text-gray-500" numberOfLines={1}>
                      {item.serviceTitle}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-base font-sans-bold text-emerald-600 mb-1">+ {item.totalEarnings}</Text>
                    <View
                      className={`rounded-full px-2 py-0.5 ${
                        item.status === 'Received' ? 'bg-emerald-50' : 'bg-amber-50'
                      }`}
                    >
                      <Text
                        className={`text-[9px] font-sans-bold ${
                          item.status === 'Received' ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {item.status}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            />
          ) : (
            <PaginationList
              data={filteredCommissions}
              keyExtractor={(item: CommissionDueItem) => item.id}
              pageSize={4}
              emptyTitle="No commissions due found"
              emptyDescription="There are no commissions matching the current filter."
              renderItem={(item: CommissionDueItem) => (
                <View
                  style={cardShadow}
                  className="rounded-xl border border-gray-200 bg-white p-3.5 flex-row justify-between items-center"
                >
                  <View className="flex-1 mr-3">
                    <Text className="text-xs font-sans-bold text-gray-400 mb-0.5">{item.date}</Text>
                    <Text className="text-sm font-sans-bold text-gray-900" numberOfLines={1}>
                      {item.customerName}
                    </Text>
                    <Text className="text-xs font-sans-medium text-gray-500" numberOfLines={1}>
                      {item.serviceTitle}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-sm font-sans-bold text-red-650 mb-0.5">Fee: - {item.commission}</Text>
                    <Text className="text-[10px] font-sans-medium text-gray-400 mb-1">Order: {item.totalEarnings}</Text>
                    <View
                      className={`rounded-full px-2 py-0.5 ${item.status === 'Paid' ? 'bg-emerald-50' : 'bg-red-50'}`}
                    >
                      <Text
                        className={`text-[9px] font-sans-bold ${
                          item.status === 'Paid' ? 'text-emerald-700' : 'text-red-700'
                        }`}
                      >
                        {item.status}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            />
          )}
        </View>

        <View className="h-4" />
      </ContentLayout>
    </View>
  );
}
