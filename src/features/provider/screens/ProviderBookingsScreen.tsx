import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { LoadMoreList, SectionHeader } from '@/components/common';
import ErrorState from '@/components/ui/ErrorState';
import LoadingState from '@/components/ui/LoadingState';
import { ProviderOrderCard } from '@/components/home';
import ContentLayout from '@/components/layout/ContentLayout';
import Header from '@/components/navigation/Header';
import SearchBar from '@/components/ui/SearchBar';
import { THEME_COLORS } from '@/constants/colors';
import { ROUTES } from '@/constants/routes';
import { BOOKING_STATUS_FILTER_OPTIONS, BOOKING_FILTER_STATUSES } from '@/constants/bookings';
import { BOOKING_STATUSES, type BookingFilterStatus } from '@/types';
import BookingStatusFilter from '@/features/customer/components/BookingStatusFilter';
import EmptyBookingsState from '@/features/customer/components/EmptyBookingsState';
import { useGetBookingsQuery, useUpdateBooking } from '@/api';
import { useSnackbar } from '@/components/ui/Snackbar';
import { getAvatarUrl } from '@/utils/image';
import { formatDate, formatTime } from '@/utils/time';

export default function ProviderBookingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<BookingFilterStatus>(BOOKING_FILTER_STATUSES.All);

  const statusParam = selectedStatus === BOOKING_FILTER_STATUSES.All ? undefined : selectedStatus;
  const {
    data: bookingsData,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useGetBookingsQuery({ status: statusParam, limit: 50 });
  const updateBooking = useUpdateBooking();
  const { showSnackbar } = useSnackbar();

  const bookings = useMemo(() => bookingsData?.data || [], [bookingsData?.data]);

  const countsByStatus = useMemo(() => {
    const counts = {} as Record<BookingFilterStatus, number>;
    for (const status of BOOKING_STATUS_FILTER_OPTIONS) counts[status] = 0;
    counts[BOOKING_FILTER_STATUSES.All] = bookings.length;
    bookings.forEach((booking) => {
      counts[booking.status] += 1;
    });
    return counts;
  }, [bookings]);

  const providerItems = useMemo(
    () =>
      bookings.map((booking) => ({
        id: booking.id,
        customerName: booking.user?.name || 'Customer',
        customerAvatar: getAvatarUrl(booking.user?.avatar),
        serviceLabel: booking.service?.name || 'Service',
        location: booking.city ? `${booking.city}${booking.address ? `, ${booking.address}` : ''}` : 'Nepal',
        bookingDate: [formatDate(booking.service_date), formatTime(booking.start_time)].filter(Boolean).join(', '),
        bookedPrice: booking.invoice?.total ? `Rs. ${Number(booking.invoice.total).toLocaleString()}` : '',
        status: booking.status,
        cancelReason: booking.cancellation_reason || undefined,
      })),
    [bookings],
  );

  const handleAcceptOrder = useCallback(
    (id: string) => {
      updateBooking.mutate(
        { id, data: { status: BOOKING_STATUSES.Confirmed } },
        { onSuccess: () => showSnackbar({ message: t('provider.bookingAccepted'), type: 'success' }) },
      );
    },
    [updateBooking, t, showSnackbar],
  );

  const handleDeclineOrder = useCallback(
    (id: string) => {
      updateBooking.mutate(
        {
          id,
          data: { status: BOOKING_STATUSES.Rejected, cancellation_reason: 'Provider declined the booking request.' },
        },
        { onSuccess: () => showSnackbar({ message: t('provider.bookingDeclined'), type: 'success' }) },
      );
    },
    [updateBooking, t, showSnackbar],
  );

  const filteredItems = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return providerItems;
    return providerItems.filter((b) => {
      const q = normalizedQuery;
      return (
        b.customerName.toLowerCase().includes(q) ||
        b.serviceLabel.toLowerCase().includes(q) ||
        b.location.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, providerItems]);

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
        onRefresh={() => {
          refetch();
        }}
        refreshing={isRefetching}
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: 20,
          paddingBottom: Math.max(insets.bottom, 24),
        }}
      >
        <SectionHeader
          title={t('provider.incomingBookingsTitle')}
          description={t('provider.incomingBookingsDesc')}
          className="mb-5"
          titleClassName="text-2xl"
        />

        <View className="mb-4 flex-row items-center gap-3">
          <View className="flex-1">
            <BookingStatusFilter
              selectedStatus={selectedStatus}
              countsByStatus={countsByStatus}
              onStatusChange={setSelectedStatus}
            />
          </View>

          <Pressable
            onPress={() => setSearchExpanded((prev) => !prev)}
            accessibilityRole="button"
            accessibilityLabel={searchExpanded ? t('provider.closeSearch') : t('provider.openSearch')}
            accessibilityState={{ expanded: searchExpanded }}
            style={{ borderRadius: 10 }}
            className="h-12 w-12 border border-gray-200 bg-white items-center justify-center active:opacity-80"
          >
            <Feather
              name={searchExpanded ? 'x' : 'search'}
              size={18}
              color={searchExpanded ? THEME_COLORS.slate500 : THEME_COLORS.primary}
            />
          </Pressable>
        </View>

        {searchExpanded ? (
          <View className="mb-5">
            <SearchBar
              placeholder={t('provider.searchBookingPlaceholder')}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onClear={() => setSearchQuery('')}
              autoFocus
            />
          </View>
        ) : null}

        {isLoading ? (
          <LoadingState className="flex-1 items-center justify-center py-20" />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} className="py-6 mt-4" />
        ) : (
          <LoadMoreList
            key={`${selectedStatus}-${searchQuery.trim().toLowerCase()}`}
            data={filteredItems}
            keyExtractor={(booking) => booking.id}
            initialVisibleCount={4}
            pageSize={4}
            loadMoreLabel={t('customer.loadMoreBookings')}
            endReachedLabel={t('customer.noMoreBookings')}
            emptyContent={
              <EmptyBookingsState
                title={t('customer.noBookingsMatchFilter')}
                description={t('customer.noBookingsMatchFilterDesc')}
              />
            }
            renderItem={(item) => (
              <ProviderOrderCard
                order={item}
                onAccept={handleAcceptOrder}
                onDecline={handleDeclineOrder}
                onPress={() => {
                  router.push(ROUTES.provider.bookingDetail(item.id));
                }}
              />
            )}
          />
        )}

        <View className="h-3" />
      </ContentLayout>
    </View>
  );
}
