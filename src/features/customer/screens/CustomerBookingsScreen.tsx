import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { LoadMoreList, ProviderCard, SectionHeader } from '@/components/common';
import ContentLayout from '@/components/layout/ContentLayout';
import Header from '@/components/navigation/Header';
import SearchBar from '@/components/ui/SearchBar';
import { THEME_COLORS } from '@/constants/colors';
import { BOOKING_STATUS_FILTER_OPTIONS, BOOKING_FILTER_STATUSES } from '@/constants/bookings';
import type { BookingFilterStatus } from '@/types';
import ErrorState from '@/components/ui/ErrorState';
import LoadingState from '@/components/ui/LoadingState';
import BookingStatusFilter from '../components/BookingStatusFilter';
import EmptyBookingsState from '../components/EmptyBookingsState';
import { ROUTES } from '@/constants/routes';
import { useGetBookingsQuery } from '@/api';
import { getAvatarUrl } from '@/utils/image';
import { getProviderRating } from '@/utils/rating';

export default function CustomerBookingsScreen() {
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
  } = useGetBookingsQuery({ status: statusParam, page: 1, limit: 50 });

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

  const formatLocation = (b: (typeof bookings)[0]) => {
    if (b.provider?.city && b.provider?.address) return `${b.provider.address}, ${b.provider.city}`;
    return b.provider?.city || b.city || 'Nepal';
  };

  const formatPrice = (invoice: (typeof bookings)[0]['invoice']) => {
    if (!invoice?.total) return '';
    return `Rs. ${Number(invoice.total).toLocaleString()}`;
  };

  const filteredBookings = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return bookings;
    return bookings.filter((b) => {
      const providerName = b.provider?.name?.toLowerCase() || '';
      const serviceName = b.service?.name?.toLowerCase() || '';
      const location = b.provider?.city?.toLowerCase() || b.city?.toLowerCase() || '';
      return (
        providerName.includes(normalizedQuery) ||
        serviceName.includes(normalizedQuery) ||
        location.includes(normalizedQuery)
      );
    });
  }, [searchQuery, bookings]);

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
          title={t('customer.myBookingsTitle')}
          description={t('customer.myBookingsDesc')}
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
            accessibilityLabel={searchExpanded ? t('common.close') : t('common.search')}
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
              placeholder={t('customer.searchBookingPlaceholder')}
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
            data={filteredBookings}
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
            renderItem={(booking) => (
              <ProviderCard
                avatarUri={getAvatarUrl(booking.provider?.avatar)}
                name={booking.provider?.name || 'Service Provider'}
                serviceLabel={booking.service?.name || booking.service?.category?.name || 'Service'}
                location={formatLocation(booking)}
                rating={getProviderRating([booking.service, booking.provider]).toFixed(1)}
                ordersCompleted=""
                startingFromPrice={formatPrice(booking.invoice)}
                bookingStatus={booking.status}
                variant="booking"
                onPress={() => {
                  router.push(ROUTES.customer.bookingDetail(booking.id));
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
