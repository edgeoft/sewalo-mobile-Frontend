import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, View, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LoadMoreList, ProviderCard, SectionHeader } from '@/components/common';
import ContentLayout from '@/components/layout/ContentLayout';
import Header from '@/components/navigation/Header';
import Input from '@/components/ui/Input';
import { BOOKING_STATUS_FILTER_OPTIONS } from '@/constants/bookings';
import { BOOKING_STATUSES, type BookingStatus } from '@/types';
import BookingStatusFilter from '../components/BookingStatusFilter';
import EmptyBookingsState from '../components/EmptyBookingsState';
import { ROUTES } from '@/constants/routes';
import { useGetMyBookingsQuery } from '@/api/bookings';
import { getImageUrl } from '@/utils/image';

export default function CustomerBookingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus>(BOOKING_STATUSES.All);

  const statusParam = selectedStatus === BOOKING_STATUSES.All ? undefined : selectedStatus;
  const { data: bookingsData, isLoading } = useGetMyBookingsQuery({ status: statusParam, limit: 50 });

  const bookings = bookingsData?.data || [];

  const countsByStatus = useMemo(() => {
    const counts = BOOKING_STATUS_FILTER_OPTIONS.reduce(
      (acc, status) => ({ ...acc, [status]: 0 }),
      {} as Record<BookingStatus, number>,
    );

    counts[BOOKING_STATUSES.All] = bookings.length;
    bookings.forEach((booking) => {
      if (counts[booking.status] !== undefined) counts[booking.status] += 1;
    });

    return counts;
  }, [bookings]);

  const getAvatarUri = (avatar: string | null | undefined) => {
    return getImageUrl(avatar) || 'https://i.pravatar.cc/300?img=12';
  };

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
      <Header variant="menu" showNotifications onNotificationsPress={() => router.push(ROUTES.notifications)} />

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
          title="My Bookings"
          description="Track all bookings and filter by status."
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
            accessibilityLabel={searchExpanded ? 'Close search' : 'Open search'}
            className="h-12 w-12 rounded-xl border border-gray-200 bg-white items-center justify-center active:opacity-80"
            style={{
              shadowColor: '#0f172a',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.04,
              shadowRadius: 10,
              elevation: 2,
            }}
          >
            <Feather name={searchExpanded ? 'x' : 'search'} size={18} color={searchExpanded ? '#64748b' : '#485aff'} />
          </Pressable>
        </View>

        {searchExpanded ? (
          <View className="mb-5">
            <Input
              placeholder="Search booking by provider, service, or location"
              value={searchQuery}
              onChangeText={setSearchQuery}
              leftIcon={null}
              className="h-14"
              inputClassName="text-sm font-sans-medium text-gray-500"
              containerStyle={{
                shadowColor: '#0f172a',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.08,
                shadowRadius: 18,
                elevation: 4,
              }}
              rightIcon={<Feather name="search" size={20} color="#485aff" />}
            />
          </View>
        ) : null}

        {isLoading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#485aff" />
          </View>
        ) : (
          <LoadMoreList
            key={`${selectedStatus}-${searchQuery.trim().toLowerCase()}`}
            data={filteredBookings}
            keyExtractor={(booking) => booking.id}
            initialVisibleCount={4}
            pageSize={4}
            loadMoreLabel="Load More Bookings"
            endReachedLabel="No more bookings"
            emptyContent={
              <EmptyBookingsState
                title="No bookings match your filter"
                description="Try changing your status filter or search query."
              />
            }
            renderItem={(booking) => (
              <ProviderCard
                avatarUri={getAvatarUri(booking.provider?.avatar)}
                name={booking.provider?.name || 'Service Provider'}
                serviceLabel={booking.service?.name || booking.service?.category?.name || 'Service'}
                location={formatLocation(booking)}
                rating={Number(booking.provider?.avg_rating || 0).toFixed(1)}
                ordersCompleted=""
                startingFromPrice={formatPrice(booking.invoice)}
                bookingStatus={booking.status}
                actionLabel="View Details"
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
