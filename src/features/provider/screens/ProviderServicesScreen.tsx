import React, { useState } from 'react';
import { Text, View, Alert, Image, Pressable, Linking, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { SectionHeader } from '@/components/common';
import { Carousel } from '@/components/ui';
import ContentLayout from '@/components/layout/ContentLayout';
import Header from '@/components/navigation/Header';
import Button from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';
import { useGetMyServicesQuery } from '../api/hooks/services';
import { ENV } from '@/constants/env';
import { getImageUrl } from '@/utils/image';
import { SERVICE_LOCATIONS } from '@/types';

// Mock active service data
const ACTIVE_SERVICE_MOCK = {
  name: 'Premium Home Sanitization & Deep Cleaning',
  category: 'Cleaning Services',
  description:
    'We provide professional deep cleaning services using eco-friendly materials. Our team of certified professionals ensures a 100% dust-free and sanitized environment for your homes and offices.',
  locations: [
    {
      type: 'At Customer Location',
      active: true,
      icon: 'map-pin' as const,
      bg: 'bg-[#eef1ff]',
      text: 'text-primary',
      iconColor: '#485aff',
    },
    {
      type: 'Fixed Provider Studio',
      active: false,
      icon: 'home' as const,
      bg: 'bg-gray-50',
      text: 'text-gray-400',
      iconColor: '#94a3b8',
    },
    {
      type: 'Remote / Online Call',
      active: true,
      icon: 'globe' as const,
      bg: 'bg-[#e8fbf3]',
      text: 'text-emerald-700',
      iconColor: '#10b981',
    },
  ],
  hashtags: ['#DeepCleaning', '#Sanitization', '#KathmanduServices', '#EcoFriendly', '#CleanHome'],
  portfolioPhotos: [
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1563453392212-326f5e854473?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=400&auto=format&fit=crop',
  ],
  portfolioUrl: 'https://www.cleansewalo.com',
  subcategories: [
    { id: 'sub-1', title: 'Bathroom Deep Cleaning', price: 'Rs. 1,200', duration: '2 hrs' },
    { id: 'sub-2', title: 'Kitchen Sanitization', price: 'Rs. 1,800', duration: '3 hrs' },
    { id: 'sub-3', title: 'Sofa & Carpet Shampooing', price: 'Rs. 1,500', duration: '1.5 hrs' },
    { id: 'sub-4', title: 'Full House Dusting & Polish', price: 'Rs. 2,000', duration: '4 hrs' },
  ],
  packages: [
    {
      id: 'pkg-1',
      title: 'Standard Home Makeover',
      description:
        'Includes full kitchen sanitization, bathroom deep cleaning, and sofa shampooing with a 2-day warranty.',
      price: 'Rs. 4,500',
    },
    {
      id: 'pkg-2',
      title: 'Express Dusting & Sanitization',
      description: 'Includes full living room and kitchen sanitization, vacuuming, and trash disposal.',
      price: 'Rs. 2,200',
    },
    {
      id: 'pkg-3',
      title: 'Complete Sanitization Pro',
      description: 'Full house sanitization with professional UV light treatment and eco-friendly products.',
      price: 'Rs. 6,000',
    },
  ],
};

export default function ProviderServicesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data, isLoading } = useGetMyServicesQuery();

  const handleCreateService = () => {
    router.push({ pathname: ROUTES.provider.serviceEdit as any, params: { mode: 'add' } });
  };

  const handleOpenPortfolio = (url: string) => {
    if (!url) return;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Unable to open portfolio website.');
    });
  };

  const cardShadow = {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-secondary">
        <Header variant="menu" showNotifications={false} />
        <ContentLayout scrollable className="flex-1">
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#485aff" />
          </View>
        </ContentLayout>
      </View>
    );
  }

  const service = data?.data;
  const hasService = !!service?.id;

  // Prepare portfolio photos list
  const portfolioPhotos =
    service?.portfolio && service.portfolio.length > 0
      ? service.portfolio.map(
          (p) =>
            getImageUrl(p) ||
            'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=400&auto=format&fit=crop',
        )
      : ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=400&auto=format&fit=crop'];

  // Prepare offerings mapping
  const offerings =
    service?.service_offerings?.map((offering) => ({
      id: offering.id,
      title: offering.sub_category?.name || 'Service Offering',
      price: `Rs. ${offering.price}`,
      duration: `${offering.duration} ${offering.duration_unit || 'hrs'}`,
    })) || [];

  // Prepare packages mapping
  const packages =
    service?.service_packages?.map((pkg) => ({
      id: pkg.id,
      title: pkg.name,
      description: pkg.description || 'Custom curated packages to fit all your needs and requirements.',
      price: `Rs. ${pkg.price}`,
    })) || [];

  // Locations mapping
  const locations = [
    {
      type: 'At Customer Location',
      active: service?.service_location?.includes(SERVICE_LOCATIONS.Customer) || false,
      icon: 'map-pin' as const,
    },
    {
      type: 'Fixed Provider Studio',
      active: service?.service_location?.includes(SERVICE_LOCATIONS.Fixed) || false,
      icon: 'home' as const,
    },
    {
      type: 'Remote / Online Call',
      active: service?.service_location?.includes(SERVICE_LOCATIONS.Remote) || false,
      icon: 'globe' as const,
    },
  ];

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
        {hasService ? (
          <View className="gap-y-5">
            {/* 1. Header Card (Service Name, Category, and Preview Image) */}
            <View style={cardShadow} className="rounded-xl border border-gray-200 bg-white p-4">
              {/* Title Section */}
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1 mr-2">
                  <View className="flex-row items-center flex-wrap gap-x-2 gap-y-1">
                    <Text className="text-xl font-sans-extrabold text-gray-900 leading-7">{service.name}</Text>
                    {service.provider?.status === 'verified' && (
                      <View className="rounded-full bg-emerald-50 border border-emerald-200/50 px-2 py-0.5 self-start">
                        <Text className="text-[8px] font-sans-bold text-emerald-700 uppercase">Verified</Text>
                      </View>
                    )}
                    {service.provider?.status === 'completed' && (
                      <View className="rounded-full bg-amber-50 border border-amber-200/50 px-2 py-0.5 self-start">
                        <Text className="text-[8px] font-sans-bold text-amber-700 uppercase">Under Review</Text>
                      </View>
                    )}
                    {service.provider?.status === 'pending' && (
                      <View className="rounded-full bg-gray-50 border border-gray-200/50 px-2 py-0.5 self-start">
                        <Text className="text-[8px] font-sans-bold text-gray-500 uppercase">Pending</Text>
                      </View>
                    )}
                    {service.provider?.status === 'rejected' && (
                      <View className="rounded-full bg-red-50 border border-red-200/50 px-2 py-0.5 self-start">
                        <Text className="text-[8px] font-sans-bold text-red-700 uppercase">Rejected</Text>
                      </View>
                    )}
                    {service.provider?.status === 'suspended' && (
                      <View className="rounded-full bg-red-50 border border-red-200/50 px-2 py-0.5 self-start">
                        <Text className="text-[8px] font-sans-bold text-red-700 uppercase">Suspended</Text>
                      </View>
                    )}
                  </View>
                  <View className="rounded-full bg-indigo-50 border border-indigo-100/50 px-2.5 py-0.5 self-start mt-2">
                    <Text className="text-[10px] font-sans-bold text-primary uppercase tracking-wider">
                      {service.category?.name || 'Cleaning Services'}
                    </Text>
                  </View>
                </View>
                {/* Edit Button */}
                <Pressable
                  onPress={() =>
                    router.push({ pathname: ROUTES.provider.serviceEdit as any, params: { mode: 'edit' } })
                  }
                  className="h-8 w-8 rounded-full bg-gray-50 border border-gray-200 items-center justify-center active:bg-gray-150"
                >
                  <Feather name="edit-2" size={13} color="#485aff" />
                </Pressable>
              </View>

              {/* Preview Image */}
              <View className="rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                <Image source={{ uri: portfolioPhotos[0] }} className="h-52 w-full" resizeMode="cover" />
              </View>
            </View>

            {/* 2. About / Description Card */}
            <View style={cardShadow} className="rounded-xl border border-gray-200 bg-white p-4">
              <Text className="text-xs font-sans-bold text-gray-400 uppercase tracking-wider mb-2">
                About the Service
              </Text>
              <Text className="text-xs font-sans-medium text-gray-500 leading-5">{service.description}</Text>
            </View>

            {/* 3. Services Offered Card */}
            {offerings.length > 0 && (
              <View style={cardShadow} className="rounded-xl border border-gray-200 bg-white p-4">
                <Text className="text-xs font-sans-bold text-gray-400 uppercase tracking-wider mb-3">
                  Services Offered
                </Text>
                <View className="gap-y-3">
                  {offerings.map((sub, idx) => (
                    <View
                      key={sub.id}
                      className={`flex-row justify-between items-center py-0.5 ${
                        idx !== offerings.length - 1 ? 'border-b border-gray-100 pb-2.5' : ''
                      }`}
                    >
                      <View className="flex-row items-center gap-2.5">
                        <View className="h-6 w-6 rounded-full bg-emerald-50 items-center justify-center">
                          <Feather name="check" size={12} color="#059669" />
                        </View>
                        <View>
                          <Text className="text-xs font-sans-semibold text-gray-700">{sub.title}</Text>
                          <Text className="text-[10px] font-sans-medium text-gray-400 mt-0.5">
                            Duration: {sub.duration}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-xs font-sans-bold text-primary">{sub.price}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* 4. Featured Package Deals Card */}
            {packages.length > 0 && (
              <View style={cardShadow} className="rounded-xl border border-gray-200 bg-white p-4">
                <Text className="text-xs font-sans-bold text-gray-400 uppercase tracking-wider mb-3">
                  Featured Package Deals
                </Text>
                <Carousel
                  data={packages}
                  keyExtractor={(pkg) => pkg.id}
                  gap={12}
                  autoplay={true}
                  autoplayInterval={6000}
                  renderItem={({ item: pkg, cardWidth }) => (
                    <View
                      style={{ width: cardWidth }}
                      className="rounded-lg border border-indigo-50 bg-indigo-50/20 p-3.5 min-h-[110px]"
                    >
                      <View className="flex-row justify-between items-start mb-2">
                        <View className="flex-1 mr-2">
                          <Text className="text-xs font-sans-bold text-gray-900" numberOfLines={1}>
                            {pkg.title}
                          </Text>
                          <View className="bg-primary/10 rounded px-1.5 py-0.5 self-start mt-1">
                            <Text className="text-[9px] font-sans-bold text-primary">Best Value</Text>
                          </View>
                        </View>
                        <Text className="text-xs font-sans-bold text-primary">{pkg.price}</Text>
                      </View>
                      <Text className="text-[10px] font-sans-medium text-gray-500 leading-4">{pkg.description}</Text>
                    </View>
                  )}
                />
              </View>
            )}

            {/* 5. Work Portfolio Card */}
            {portfolioPhotos.length > 1 && (
              <View style={cardShadow} className="rounded-xl border border-gray-200 bg-white p-4">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-xs font-sans-bold text-gray-400 uppercase tracking-wider">Work Portfolio</Text>
                  {service.portfolio_url ? (
                    <Pressable
                      onPress={() => handleOpenPortfolio(service.portfolio_url)}
                      className="flex-row items-center gap-1"
                    >
                      <Feather name="link" size={10} color="#485aff" />
                      <Text className="text-[10px] font-sans-bold text-primary underline">Website</Text>
                    </Pressable>
                  ) : null}
                </View>

                <Carousel
                  data={portfolioPhotos.slice(1)}
                  keyExtractor={(photo, idx) => `${photo}-${idx}`}
                  gap={12}
                  autoplay={true}
                  autoplayInterval={6000}
                  renderItem={({ item: photo }) => (
                    <View className="h-44 w-full rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                      <Image source={{ uri: photo }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    </View>
                  )}
                />
              </View>
            )}

            {/* 6. Service Locations & Availability Card */}
            <View style={cardShadow} className="rounded-xl border border-gray-200 bg-white p-4">
              <Text className="text-xs font-sans-bold text-gray-400 uppercase tracking-wider mb-3">
                Service Locations & Availability
              </Text>
              <View className="gap-y-3">
                {locations.map((loc, idx) => (
                  <View
                    key={idx}
                    className={`flex-row justify-between items-center py-0.5 ${
                      idx !== locations.length - 1 ? 'border-b border-gray-100 pb-2.5' : ''
                    }`}
                  >
                    <View className="flex-row items-center gap-2.5">
                      <View
                        className={`h-6 w-6 rounded-full items-center justify-center ${
                          loc.active ? 'bg-indigo-50' : 'bg-gray-50'
                        }`}
                      >
                        <Feather name={loc.icon} size={12} color={loc.active ? '#485aff' : '#94a3b8'} />
                      </View>
                      <Text className={`text-xs font-sans-semibold ${loc.active ? 'text-gray-700' : 'text-gray-400'}`}>
                        {loc.type}
                      </Text>
                    </View>
                    <Text className={`text-[10px] font-sans-bold ${loc.active ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {loc.active ? 'Available' : 'Not Offered'}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* 7. Hashtags Card */}
            {service.tags && service.tags.length > 0 && (
              <View style={cardShadow} className="rounded-xl border border-gray-200 bg-white p-4">
                <Text className="text-xs font-sans-bold text-gray-400 uppercase tracking-wider mb-3">Hashtags</Text>
                <View className="flex-row flex-wrap gap-1.5">
                  {service.tags.map((tag, idx) => (
                    <View key={idx} className="bg-indigo-50/50 rounded-full px-3 py-1">
                      <Text className="text-[10px] font-sans-bold text-primary">#{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        ) : (
          <View className="flex-1">
            <SectionHeader
              title="My Services"
              description="Manage your service catalog, prices, and bookings details."
              className="mb-6"
              titleClassName="text-2xl"
            />

            {/* Empty State */}
            <View className="flex-1 justify-center items-center px-4 py-12">
              <Svg width={120} height={120} viewBox="0 0 120 120">
                <Circle cx="60" cy="60" r="50" fill="#eef2ff" />
                <Rect x="40" y="45" width="40" height="32" rx="6" fill="#485aff" />
                <Path d="M48 45v-6a4 4 0 0 1 4-4h16a4 4 0 0 1 4 4v6" stroke="#485aff" strokeWidth="2.5" fill="none" />
                <Circle cx="60" cy="61" r="5" fill="#ffffff" />
                <Circle cx="30" cy="80" r="10" fill="#f1f5f9" />
                <Path d="M26 80h8M30 76v8" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                <Circle cx="90" cy="45" r="12" fill="#fff6e6" />
              </Svg>

              <Text className="text-base font-sans-bold text-gray-900 mt-5 mb-1.5 text-center">
                No Services Created Yet
              </Text>

              <Text className="text-xs font-sans-medium text-gray-500 text-center leading-5 mb-6 max-w-[280px]">
                Create and publish your services to start receiving bookings from customers in your area.
              </Text>

              <Button
                title="Create a Service"
                variant="primary"
                size="sm"
                className="px-6 rounded-lg"
                leftIcon={<Feather name="plus" size={14} color="#ffffff" />}
                onPress={handleCreateService}
              />
            </View>
          </View>
        )}
      </ContentLayout>
    </View>
  );
}
