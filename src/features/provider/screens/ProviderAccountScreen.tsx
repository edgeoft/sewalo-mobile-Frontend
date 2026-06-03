import { useRouter } from 'expo-router';
import { Alert, Image, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SectionHeader } from '@/components/common';
import ContentLayout from '@/components/layout/ContentLayout';
import Header from '@/components/navigation/Header';
import LanguageSelector from '@/components/ui/LanguageSelector';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/providers/AuthProvider';

import AccountMenuSectionCard from '@/features/customer/components/AccountMenuSectionCard';
import { Feather } from '@expo/vector-icons';
import { PROVIDER_ACCOUNT_MENU } from '../constants/accountMenu';

export default function ProviderAccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();

  const handleEditProfile = () => {
    router.push(ROUTES.provider.editProfile);
  };

  const handlePayoutSettings = () => {
    Alert.alert(
      'Payout Settings',
      'Manage your receiving payout methods:\n\n1. eSewa Wallet (Active)\n2. Nepal Investment Bank (Secondary)\n3. Khalti Wallet',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Manage Bank', onPress: () => Alert.alert('Bank Account', 'Manage bank account details.') },
      ],
    );
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of your provider partner account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/auth/signin');
        },
      },
    ]);
  };

  const handleItemPress = (itemId: string) => {
    switch (itemId) {
      case 'edit-profile':
        handleEditProfile();
        break;
      case 'payout-accounts':
        handlePayoutSettings();
        break;
      case 'verification-documents':
        router.push(ROUTES.provider.verificationDocuments);
        break;
      case 'notification-settings':
        Alert.alert('Notification Settings', 'Update notifications.');
        break;
      case 'privacy-settings':
        Alert.alert('Privacy Settings', 'Update privacy settings.');
        break;
      case 'change-password':
        router.push(ROUTES.provider.changePassword);
        break;
      case 'help-faq':
        Alert.alert('Help & FAQ', 'Open support articles.');
        break;
      case 'contact-support':
        Alert.alert('Contact Support', 'Connecting to support agents...');
        break;
      case 'terms-of-service':
        Alert.alert('Terms of Service', 'Display legal agreement.');
        break;
      case 'privacy-policy':
        Alert.alert('Privacy Policy', 'Display privacy statement.');
        break;
      case 'rate-app':
        Alert.alert('Rate App', 'Thank you for your rating!');
        break;
      case 'logout':
        handleLogout();
        break;
      default:
        break;
    }
  };

  const cardShadow = {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  };

  return (
    <View className="flex-1 bg-secondary">
      {/* Header with notifications icon */}
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
        {/* Title */}
        <SectionHeader
          title="Account"
          description="Manage your business profile, payouts, and preferences."
          className="mb-5"
          titleClassName="text-2xl"
        />

        {/* 1. Partner Profile Card */}
        <View
          style={cardShadow}
          className="rounded-xl border border-gray-200 bg-white p-4 mb-5 flex-row items-center justify-between"
        >
          <View className="flex-row items-center flex-1">
            <View className="relative">
              <Image
                source={{ uri: 'https://i.pravatar.cc/300?img=47' }}
                className="h-16 w-16 rounded-full border border-gray-100 bg-gray-50"
                resizeMode="cover"
              />
              <View className="absolute bottom-0 right-0 h-4.5 w-4.5 rounded-full bg-blue-500 border-2 border-white items-center justify-center">
                <Feather name="check" size={10} color="#ffffff" />
              </View>
            </View>

            <View className="ml-4 flex-1">
              <Text className="text-base font-sans-extrabold text-gray-900 leading-5">Pepper Potts</Text>
              <Text className="text-[11px] font-sans-medium text-gray-400 mt-0.5">pepperpotts@gmail.com</Text>
              <Text className="text-[11px] font-sans-medium text-gray-400 mt-0.5">+977 9802117361</Text>

              {/* Rating and Services */}
              <View className="flex-row items-center gap-1.5 mt-1.5">
                <Text className="text-xs font-sans-bold text-gray-700">UI/UX & Design</Text>
                <View className="h-1 w-1 rounded-full bg-gray-300" />
                <View className="flex-row items-center gap-0.5">
                  <Feather name="star" size={10} color="#f59e0b" fill="#f59e0b" />
                  <Text className="text-[10px] font-sans-bold text-gray-600">4.9</Text>
                  <Text className="text-[10px] font-sans-medium text-gray-400">(128)</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 2. Settings Categories (Config Driven) */}
        <View className="gap-y-5">
          {PROVIDER_ACCOUNT_MENU.map((section) => (
            <AccountMenuSectionCard
              key={section.title}
              section={section}
              onItemPress={handleItemPress}
              rightContentMap={{
                language: <LanguageSelector />,
              }}
            />
          ))}
        </View>
      </ContentLayout>
    </View>
  );
}
