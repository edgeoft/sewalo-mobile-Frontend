import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, View, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LoadMoreList, SectionHeader } from '@/components/common';
import { ProviderOrderCard } from '@/components/home';
import ContentLayout from '@/components/layout/ContentLayout';
import Header from '@/components/navigation/Header';
import Input from '@/components/ui/Input';
import { ROUTES } from '@/constants/routes';
import { BOOKING_STATUS_FILTER_OPTIONS } from '@/constants/bookings';
import { BOOKING_STATUSES, type BookingStatus } from '@/types';
import BookingStatusFilter from '@/features/customer/components/BookingStatusFilter';
import EmptyBookingsState from '@/features/customer/components/EmptyBookingsState';
import { useGetBookingsQuery, useUpdateBooking } from '@/api/bookings';
import { getImageUrl } from '@/utils/image';

function formatDate(dateString: string) {
  if (!dateString) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toISOString().split('T')[0];
  } catch {
    return dateString;
  }
}

function formatTime(timeString: string) {
  if (!timeString) return '';
  if (/^\d{1,2}:\d{2}$/.test(timeString)) return timeString;
  try {
    const date = new Date(timeString);
    if (isNaN(date.getTime())) return timeString;
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  } catch {
    return timeString;
  }
}

export default function ProviderBookingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus>(BOOKING_STATUSES.All);

  const statusParam = selectedStatus === BOOKING_STATUSES.All ? undefined : selectedStatus;
  const { data: bookingsData, isLoading } = useGetBookingsQuery({ status: statusParam, limit: 50 });
  const updateBooking = useUpdateBooking();

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

  const mapToProviderItem = (booking: (typeof bookings)[0]) => ({
    id: booking.id,
    customerName: booking.user?.name || 'Customer',
    customerAvatar: getImageUrl(booking.user?.avatar) || 'https://i.pravatar.cc/300?img=33',
    serviceLabel: booking.service?.name || 'Service',
    location: booking.city ? `${booking.city}${booking.address ? `, ${booking.address}` : ''}` : 'Nepal',
    bookingDate: [formatDate(booking.service_date), formatTime(booking.start_time)].filter(Boolean).join(', '),
    bookedPrice: booking.invoice?.total ? `Rs. ${Number(booking.invoice.total).toLocaleString()}` : '',
    status: booking.status,
    cancelReason: booking.cancellation_reason || undefined,
  });

  const handleAcceptOrder = (id: string) => {
    updateBooking.mutate({ id, data: { status: 'confirmed' } });
  };

  const handleDeclineOrder = (id: string) => {
    updateBooking.mutate({
      id,
      data: { status: 'rejected', cancellation_reason: 'Provider declined the booking request.' },
    });
  };

  const filteredBookings = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return bookings;
    return bookings.filter((b) => {
      const customerName = b.user?.name?.toLowerCase() || '';
      const serviceName = b.service?.name?.toLowerCase() || '';
      const location = b.city?.toLowerCase() || '';
      return (
        customerName.includes(normalizedQuery) ||
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
          title="Incoming Bookings"
          description="Manage client bookings and filter requests by status."
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
              placeholder="Search booking by customer, service, or location"
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
              <ProviderOrderCard
                order={mapToProviderItem(booking)}
                onAccept={handleAcceptOrder}
                onDecline={handleDeclineOrder}
                onPress={() => {
                  router.push(ROUTES.provider.bookingDetail(booking.id));
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
