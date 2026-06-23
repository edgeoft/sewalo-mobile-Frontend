import React, { useMemo, useState } from 'react';
import { Pressable, Text, View, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { PaginationList, SectionHeader } from '@/components/common';
import ContentLayout from '@/components/layout/ContentLayout';
import Header from '@/components/navigation/Header';
import { ROUTES } from '@/constants/routes';

import Button from '@/components/ui/Button';
import { useCommissionSummaryQuery, useCommissionsQuery } from '../api/hooks/commissions';
import { Commission, COMMISSION_TYPE, EARNINGS_FILTER_STATUS } from '@/types';
import { formatDate } from '@/utils/time';

type EarningsTab = COMMISSION_TYPE;
type EarningsFilter = EARNINGS_FILTER_STATUS;

export default function ProviderEarningsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<EarningsTab>(COMMISSION_TYPE.MY_EARNINGS);
  const [filterStatus, setFilterStatus] = useState<EarningsFilter>(EARNINGS_FILTER_STATUS.ALL);

  // Fetch real summary from /commissions/summary
  const {
    data: summaryData,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    refetch: refetchSummary,
  } = useCommissionSummaryQuery();

  // Fetch real transactions list from /commissions with appropriate filters
  const {
    data: commissionsData,
    isLoading: isCommissionsLoading,
    isError: isCommissionsError,
    refetch: refetchCommissions,
  } = useCommissionsQuery({
    type: activeTab,
    has_paid: filterStatus === EARNINGS_FILTER_STATUS.ALL ? undefined : filterStatus === EARNINGS_FILTER_STATUS.PAID,
    limit: 100,
  });

  const isError = isSummaryError || isCommissionsError;

  const handleRetry = () => {
    refetchSummary();
    refetchCommissions();
  };

  // Convert real earnings summary values
  const dashboardStats = useMemo(() => {
    if (!summaryData) {
      return {
        totalEarnings: 'Rs. 0',
        payableToAdmin: 'Rs. 0',
        pendingDispatch: 'Rs. 0',
      };
    }
    const {
      total_amount_earned_after_commission,
      total_commission_to_be_paid,
      total_commission_pending_dispatch_by_admin,
    } = summaryData;

    return {
      totalEarnings: `Rs. ${(total_amount_earned_after_commission || 0).toLocaleString()}`,
      payableToAdmin: `Rs. ${(total_commission_to_be_paid || 0).toLocaleString()}`,
      pendingDispatch: `Rs. ${(total_commission_pending_dispatch_by_admin || 0).toLocaleString()}`,
    };
  }, [summaryData]);

  const cardShadow = {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  };

  return (
    <View className="flex-1 bg-secondary">
      <Header
        variant="menu"
        showNotifications
        showNotificationBadge
        onNotificationsPress={() => router.push(ROUTES.notifications)}
      />

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

        {isError ? (
          <View className="flex-1 justify-center items-center py-10 px-6 bg-white rounded-xl border border-gray-200 my-4">
            <View className="h-12 w-12 rounded-full bg-red-50 items-center justify-center mb-4">
              <Feather name="alert-triangle" size={24} color="#dc2626" />
            </View>
            <Text className="text-base font-sans-bold text-gray-900 mb-1">Failed to load earnings data</Text>
            <Text className="text-xs font-sans-medium text-gray-500 text-center mb-6 leading-5">
              We encountered a network or server error while retrieving your financial summary.
            </Text>
            <View className="w-full max-w-[200px]">
              <Button title="Retry Connection" variant="primary" onPress={handleRetry} />
            </View>
          </View>
        ) : (
          <>
            {/* Dashboard Financial Summary Cards */}
            {isSummaryLoading ? (
              <View className="items-center justify-center py-12">
                <ActivityIndicator size="large" color="#485aff" />
              </View>
            ) : (
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
                      <Text className="text-xl font-sans-extrabold text-gray-900 mt-0.5">
                        {dashboardStats.totalEarnings}
                      </Text>
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
                      <Text className="text-base font-sans-bold text-gray-900 mt-0.5">
                        {dashboardStats.payableToAdmin}
                      </Text>
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
                      <Text className="text-base font-sans-bold text-gray-900 mt-0.5">
                        {dashboardStats.pendingDispatch}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

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
                    setActiveTab(COMMISSION_TYPE.MY_EARNINGS);
                    setFilterStatus(EARNINGS_FILTER_STATUS.ALL);
                  }}
                  className={`flex-1 py-2.5 rounded-md items-center ${
                    activeTab === COMMISSION_TYPE.MY_EARNINGS ? 'bg-white shadow-xs' : 'bg-transparent'
                  }`}
                >
                  <Text
                    className={`text-xs font-sans-bold ${activeTab === COMMISSION_TYPE.MY_EARNINGS ? 'text-gray-900' : 'text-gray-500'}`}
                  >
                    Receivable Earnings
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setActiveTab(COMMISSION_TYPE.COMMISSION_DUE);
                    setFilterStatus(EARNINGS_FILTER_STATUS.ALL);
                  }}
                  className={`flex-1 py-2.5 rounded-md items-center ${
                    activeTab === COMMISSION_TYPE.COMMISSION_DUE ? 'bg-white shadow-xs' : 'bg-transparent'
                  }`}
                >
                  <Text
                    className={`text-xs font-sans-bold ${activeTab === COMMISSION_TYPE.COMMISSION_DUE ? 'text-gray-900' : 'text-gray-500'}`}
                  >
                    Commissions Due
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Horizontal Status Filter Pills */}
            <View className="flex-row gap-2 mb-5">
              {([EARNINGS_FILTER_STATUS.ALL, EARNINGS_FILTER_STATUS.PAID, EARNINGS_FILTER_STATUS.UNPAID] as const).map(
                (status) => {
                  const isActive = filterStatus === status;
                  const label =
                    status === EARNINGS_FILTER_STATUS.ALL
                      ? 'All'
                      : status === EARNINGS_FILTER_STATUS.PAID
                        ? activeTab === COMMISSION_TYPE.MY_EARNINGS
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
                },
              )}
            </View>

            {/* Transactions List Section with independent loading */}
            <View className="flex-1">
              {isCommissionsLoading ? (
                <View className="flex-1 items-center justify-center py-12">
                  <ActivityIndicator size="large" color="#485aff" />
                </View>
              ) : activeTab === COMMISSION_TYPE.MY_EARNINGS ? (
                <PaginationList
                  data={commissionsData?.data || []}
                  keyExtractor={(item: Commission) => item.id}
                  pageSize={4}
                  emptyTitle="No receivable earnings found"
                  emptyDescription="There are no earnings matching the current filter."
                  renderItem={(item: Commission) => {
                    const isReceived = item.has_paid;
                    return (
                      <View
                        style={cardShadow}
                        className="rounded-xl border border-gray-200 bg-white p-3.5 flex-row justify-between items-center"
                      >
                        <View className="flex-1 mr-3">
                          <Text className="text-xs font-sans-bold text-gray-400 mb-0.5">
                            {formatDate(item.created_at)}
                          </Text>
                          <Text className="text-sm font-sans-bold text-gray-900" numberOfLines={1}>
                            {item.booking?.user?.name || 'Customer'}
                          </Text>
                          <Text className="text-xs font-sans-medium text-gray-500" numberOfLines={1}>
                            {item.booking?.service?.title || 'Service Delivery'}
                          </Text>
                        </View>
                        <View className="items-end">
                          <Text className="text-base font-sans-bold text-emerald-600 mb-1">
                            + Rs. {(item.total_earned_after_commission || 0).toLocaleString()}
                          </Text>
                          <View className={`rounded-full px-2 py-0.5 ${isReceived ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                            <Text
                              className={`text-[9px] font-sans-bold ${
                                isReceived ? 'text-emerald-700' : 'text-amber-700'
                              }`}
                            >
                              {isReceived ? 'Received' : 'Unpaid'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  }}
                />
              ) : (
                <PaginationList
                  data={commissionsData?.data || []}
                  keyExtractor={(item: Commission) => item.id}
                  pageSize={4}
                  emptyTitle="No commissions due found"
                  emptyDescription="There are no commissions matching the current filter."
                  renderItem={(item: Commission) => {
                    const isCommissionPaid = item.has_paid;
                    return (
                      <View
                        style={cardShadow}
                        className="rounded-xl border border-gray-200 bg-white p-3.5 flex-row justify-between items-center"
                      >
                        <View className="flex-1 mr-3">
                          <Text className="text-xs font-sans-bold text-gray-400 mb-0.5">
                            {formatDate(item.created_at)}
                          </Text>
                          <Text className="text-sm font-sans-bold text-gray-900" numberOfLines={1}>
                            {item.booking?.user?.name || 'Customer'}
                          </Text>
                          <Text className="text-xs font-sans-medium text-gray-500" numberOfLines={1}>
                            {item.booking?.service?.title || 'Service Delivery'}
                          </Text>
                        </View>
                        <View className="items-end">
                          <Text className="text-sm font-sans-bold text-red-650 mb-0.5">
                            Fee: - Rs. {(item.amount || 0).toLocaleString()}
                          </Text>
                          <Text className="text-[10px] font-sans-medium text-gray-400 mb-1">
                            Net: Rs. {(item.total_earned_after_commission || 0).toLocaleString()}
                          </Text>
                          <View
                            className={`rounded-full px-2 py-0.5 ${isCommissionPaid ? 'bg-emerald-50' : 'bg-red-50'}`}
                          >
                            <Text
                              className={`text-[9px] font-sans-bold ${
                                isCommissionPaid ? 'text-emerald-700' : 'text-red-700'
                              }`}
                            >
                              {isCommissionPaid ? 'Paid' : 'Unpaid'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  }}
                />
              )}
            </View>
          </>
        )}

        <View className="h-4" />
      </ContentLayout>
    </View>
  );
}
