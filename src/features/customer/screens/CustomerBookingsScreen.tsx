import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LoadMoreList, ProviderCard, SectionHeader } from '@/components/common';
import ContentLayout from '@/components/layout/ContentLayout';
import Header from '@/components/navigation/Header';
import Input from '@/components/ui/Input';
import { BOOKING_STATUS_FILTER_OPTIONS } from '@/constants/bookings';
import { BOOKING_STATUSES, type BookingStatus } from '@/types';
import BookingStatusFilter from '../components/BookingStatusFilter';
import EmptyBookingsState from '../components/EmptyBookingsState';
import { CUSTOMER_BOOKINGS_MOCK } from '../constants/customerBookings';
import { ROUTES } from '@/constants/routes';

export default function CustomerBookingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus>(BOOKING_STATUSES.All);

  const countsByStatus = useMemo(() => {
    const counts = BOOKING_STATUS_FILTER_OPTIONS.reduce(
      (acc, status) => ({ ...acc, [status]: 0 }),
      {} as Record<BookingStatus, number>,
    );

    counts[BOOKING_STATUSES.All] = CUSTOMER_BOOKINGS_MOCK.length;

    CUSTOMER_BOOKINGS_MOCK.forEach((booking) => {
      counts[booking.status] += 1;
    });

    return counts;
  }, []);

  const filteredBookings = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return CUSTOMER_BOOKINGS_MOCK.filter((booking) => {
      const matchesStatus = selectedStatus === BOOKING_STATUSES.All ? true : booking.status === selectedStatus;

      if (!matchesStatus) return false;

      if (!normalizedQuery) return true;

      return (
        booking.name.toLowerCase().includes(normalizedQuery) ||
        booking.serviceLabel.toLowerCase().includes(normalizedQuery) ||
        booking.location.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [searchQuery, selectedStatus]);

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
              avatarUri={booking.avatarUri}
              name={booking.name}
              serviceLabel={booking.serviceLabel}
              location={booking.location}
              rating={booking.rating}
              startingFromPrice={booking.bookedPrice}
              bookingStatus={booking.status}
              actionLabel="View Details"
              variant="booking"
              onPress={() => {
                router.push(ROUTES.customer.bookingDetail(booking.id));
              }}
            />
          )}
        />

        <View className="h-3" />
      </ContentLayout>
    </View>
  );
}
