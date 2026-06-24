import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ContentLayout from '@/components/layout/ContentLayout';
import Header from '@/components/navigation/Header';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/providers/AuthProvider';
import { useCreateBooking, useAddRemoveFavorite } from '@/api';
import { ProviderDetail } from '@/types';

// Import subcomponents
import BookingConfirmationModal, { type BookingDetails } from '../components/BookingConfirmationModal';
import ProviderBookingStickyBar from '../components/ProviderBookingStickyBar';
import ProviderContactDetails from '../components/ProviderContactDetails';
import ProviderHeaderCard from '../components/ProviderHeaderCard';
import ProviderOverviewTab from '../components/ProviderOverviewTab';
import ProviderPortfolioTab from '../components/ProviderPortfolioTab';
import ProviderQuickStats from '../components/ProviderQuickStats';
import ProviderReviewsTab from '../components/ProviderReviewsTab';
import ProviderServicesTab from '../components/ProviderServicesTab';

interface ProviderDetailsScreenProps {
  provider: ProviderDetail;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ProviderDetailsScreen({ provider }: ProviderDetailsScreenProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { role } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'portfolio' | 'reviews'>('services');
  const [selectedServices, setSelectedServices] = useState<Record<string, boolean>>({});
  const [isSaved, setIsSaved] = useState(provider.isFavourite || false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const addRemoveFav = useAddRemoveFavorite();

  // Booking confirmation modal states
  const [isBookingModalVisible, setIsBookingModalVisible] = useState(false);
  const [bookingModalType, setBookingModalType] = useState<'services' | 'package'>('services');

  const isGuest = role === 'guest';

  // Toggle saving to favorites
  const handleToggleSave = () => {
    if (!provider.serviceId) return;
    const newIsSaved = !isSaved;
    setIsSaved(newIsSaved);
    addRemoveFav.mutate(
      { service_id: provider.serviceId },
      {
        onError: () => setIsSaved(!newIsSaved),
      },
    );
  };

  // Share profile action
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${provider.name} (${provider.serviceLabel}) on Sewalo! Rating: ${provider.rating}/5. Location: ${provider.location}.`,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  // Toggle individual service selection
  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) => ({
      ...prev,
      [serviceId]: !prev[serviceId],
    }));
  };

  // Calculate total price of selected services
  const selectedServicesCount = useMemo(() => {
    return Object.values(selectedServices).filter(Boolean).length;
  }, [selectedServices]);

  const totalSelectedPrice = useMemo(() => {
    let total = 0;
    provider.individualServices.forEach((srv) => {
      if (selectedServices[srv.id]) {
        const cleaned = srv.price.replace(/Rs\.\s*/i, '').replace(/,/g, '');
        const priceNum = Math.round(parseFloat(cleaned));
        if (!isNaN(priceNum)) {
          total += priceNum;
        }
      }
    });
    return total;
  }, [selectedServices, provider.individualServices]);

  // Actions for Phone / Email / Directions
  const handleCall = () => {
    Linking.openURL(`tel:${provider.phone}`).catch(() => {
      Alert.alert('Error', 'Unable to initiate call on this device.');
    });
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${provider.email}`).catch(() => {
      Alert.alert('Error', 'Unable to open email client.');
    });
  };

  const handleDirections = () => {
    const query = encodeURIComponent(provider.fullLocation);
    Linking.openURL(`maps://maps.apple.com/?q=${query}`).catch(() => {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`).catch(() => {
        Alert.alert('Error', 'Unable to open maps.');
      });
    });
  };

  // Open booking confirmation modal for selected individual services
  const handleBookSelected = () => {
    if (selectedServicesCount === 0) {
      Alert.alert('No Services Selected', 'Please check at least one service to book.');
      return;
    }
    setBookingModalType('services');
    setIsBookingModalVisible(true);
  };

  // Open booking confirmation modal for special package
  const handleBookPackage = () => {
    if (!provider.specialPackage) return;
    setBookingModalType('package');
    setIsBookingModalVisible(true);
  };

  // Handle final confirmation from the modal
  const createBooking = useCreateBooking();

  const handleConfirmBooking = (details: BookingDetails) => {
    const payload = {
      service_id: provider.serviceId || '',
      service_date: details.serviceDate,
      start_time: details.startTime,
      address: details.location || 'Kathmandu Metropolitan City',
      city: details.city || 'Kathmandu',
      state: 'Bagmati',
      country: 'Nepal',
      additional_note: details.notes || undefined,
      ...(bookingModalType === 'services'
        ? {
            service_offerings: provider.individualServices
              .filter((s) => selectedServices[s.id])
              .map((s) => ({
                service_offering_id: s.id,
                unit_price: Math.round(parseFloat(s.price.replace(/Rs\.\s*/i, '').replace(/,/g, ''))) || 0,
              })),
          }
        : provider.specialPackage
          ? {
              service_packages: [
                {
                  service_package_id: provider.specialPackage.title,
                  unit_price:
                    Math.round(parseFloat(provider.specialPackage.price.replace(/Rs\.\s*/i, '').replace(/,/g, ''))) ||
                    0,
                },
              ],
            }
          : {}),
    };

    createBooking.mutate(payload as any, {
      onSuccess: (result) => {
        setIsBookingModalVisible(false);
        if (bookingModalType === 'services') {
          setSelectedServices({});
        }
        router.push({
          pathname: ROUTES.bookingConfirmation,
          params: { bookingId: result.id },
        });
      },
    });
  };

  // Determine services and pricing details to pass to the modal
  const modalServices = (() => {
    if (bookingModalType === 'package' && provider.specialPackage) {
      return [
        {
          id: 'special-package',
          title: provider.specialPackage.title,
          category: 'Special Package Deal',
          price: provider.specialPackage.price,
          durationLabel: provider.specialPackage.durationLabel,
        },
      ];
    }
    return provider.individualServices.filter((s) => selectedServices[s.id]);
  })();

  const modalPrice = (() => {
    if (bookingModalType === 'package' && provider.specialPackage) {
      const priceNum = Math.round(parseFloat(provider.specialPackage.price.replace(/Rs\.\s*/i, '').replace(/,/g, '')));
      return isNaN(priceNum) ? 0 : priceNum;
    }
    return totalSelectedPrice;
  })();

  return (
    <View className="flex-1 bg-secondary">
      {/* Restored Hamburger/Menu Navigation Header */}
      <Header
        variant="menu"
        showBackButton={true}
        showNotifications={!isGuest}
        showNotificationBadge={!isGuest}
        onNotificationsPress={() => router.push(ROUTES.notifications)}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: insets.bottom + 100, // Make extra room for sticky booking bar
        }}
      >
        <ContentLayout className="gap-y-4">
          {/* 1. Header Profile Summary Card (contains Share & Favorite buttons) */}
          <ProviderHeaderCard
            avatarUri={provider.avatarUri}
            name={provider.name}
            isVerified={provider.isVerified}
            serviceLabel={provider.serviceLabel}
            location={provider.location}
            rating={provider.rating}
            reviewCount={provider.reviewCount}
            isSaved={isSaved}
            onReviewPress={() => setActiveTab('reviews')}
            onSharePress={handleShare}
            onFavoritePress={handleToggleSave}
          />

          {/* 2. Grid of Quick Stats */}
          <ProviderQuickStats
            startingPrice={provider.startingPrice}
            ordersCompleted={provider.ordersCompleted}
            specialPackagesCount={provider.specialPackagesCount}
            availabilityLabel={provider.availabilityLabel}
          />

          {/* 3. Detailed Contact & Hour List (Handles text wrap gracefully) */}
          <ProviderContactDetails
            phone={provider.phone}
            email={provider.email}
            fullLocation={provider.fullLocation}
            workingHours={provider.workingHours}
            onCallPress={handleCall}
            onEmailPress={handleEmail}
            onDirectionsPress={handleDirections}
          />

          {/* 4. Tab Navigation Capsule */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingVertical: 4,
            }}
            className="flex-row border-b border-gray-100"
          >
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'services', label: 'Services & Pricing' },
              { id: 'portfolio', label: 'Portfolio' },
              { id: 'reviews', label: 'Reviews' },
            ].map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <Pressable
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-xl mr-2.5 border ${
                    isSelected ? 'bg-primary border-primary' : 'bg-white border-gray-200'
                  }`}
                  style={styles.shadowMin}
                >
                  <Text className={`text-xs font-sans-bold ${isSelected ? 'text-white' : 'text-gray-500'}`}>
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* 5. Tab Content Panel */}
          <View className="mt-2">
            {activeTab === 'overview' && (
              <ProviderOverviewTab
                bio={provider.bio}
                experience={provider.experience}
                languages={provider.languages}
                skills={provider.skills}
                education={provider.education}
                experienceList={provider.experienceList}
                certificates={provider.certificates}
              />
            )}

            {activeTab === 'services' && (
              <ProviderServicesTab
                specialPackage={provider.specialPackage}
                individualServices={provider.individualServices}
                selectedServices={selectedServices}
                onServiceToggle={toggleService}
                onBookPackage={handleBookPackage}
              />
            )}

            {activeTab === 'portfolio' && (
              <ProviderPortfolioTab portfolio={provider.portfolio} onImagePress={setZoomedImage} />
            )}

            {activeTab === 'reviews' && (
              <ProviderReviewsTab
                rating={provider.rating}
                reviewCount={provider.reviewCount}
                reviews={provider.reviews}
              />
            )}
          </View>
        </ContentLayout>
      </ScrollView>

      {/* Sticky Bottom Booking Bar */}
      {activeTab === 'services' && selectedServicesCount > 0 && (
        <ProviderBookingStickyBar
          selectedCount={selectedServicesCount}
          totalPrice={totalSelectedPrice}
          onBookPress={handleBookSelected}
        />
      )}

      {/* Portfolio Full Screen Zoom Modal */}
      <Modal visible={!!zoomedImage} transparent={true} animationType="fade">
        <View className="flex-1 bg-black/90 items-center justify-center px-4">
          <Pressable
            onPress={() => setZoomedImage(null)}
            className="absolute top-12 right-6 h-10 w-10 bg-white/10 rounded-full items-center justify-center z-50 active:bg-white/20"
          >
            <Feather name="x" size={24} color="#ffffff" />
          </Pressable>

          {zoomedImage && (
            <Image
              source={{ uri: zoomedImage }}
              style={{ width: SCREEN_WIDTH - 24, height: SCREEN_HEIGHT * 0.6 }}
              resizeMode="contain"
            />
          )}

          <Text className="text-white font-sans-medium text-sm mt-4 text-center">
            {provider.portfolio.find((p) => p.uri === zoomedImage)?.title || 'Work Sample'}
          </Text>
        </View>
      </Modal>

      {/* Booking Confirmation Form Modal */}
      <BookingConfirmationModal
        visible={isBookingModalVisible}
        onClose={() => setIsBookingModalVisible(false)}
        selectedServices={modalServices}
        totalPrice={modalPrice}
        onConfirm={handleConfirmBooking}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  shadowMin: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
});
