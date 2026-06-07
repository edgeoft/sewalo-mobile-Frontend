import React, { useState } from 'react';
import { View, Text, Alert, Share, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import Header from '@/components/navigation/Header';
import ContentLayout from '@/components/layout/ContentLayout';
import { SectionHeader } from '@/components/common';
import Button from '@/components/ui/Button';

export default function ReferFriendScreen() {
  const insets = useSafeAreaInsets();
  const referralCode = 'SEWALO50';
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    setCopied(true);
    Alert.alert('Copied!', 'Referral code copied to clipboard.', [
      { text: 'OK', onPress: () => setTimeout(() => setCopied(false), 2000) },
    ]);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Use my referral code "${referralCode}" to get Rs. 250 off on your first home service with Sewalo! Download the app now and start booking.`,
      });
    } catch (error: any) {
      Alert.alert('Error', 'Failed to share: ' + error.message);
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
      <Header variant="menu" showBackButton={true} showNotifications={false} />

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
          title="Refer a Friend"
          description="Invite your friends to Sewalo & get rewarded with loyalty points."
          className="mb-5"
          titleClassName="text-2xl text-gray-950 font-sans-extrabold"
        />

        {/* 1. Hero Promo Card */}
        <View style={cardShadow} className="rounded-2xl bg-primary overflow-hidden p-6 mb-5 relative">
          {/* Decorative circular shapes for premium abstract look */}
          <View className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10" />
          <View className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-white/10" />

          <Text className="text-white text-lg font-sans-extrabold leading-6">Share the Love, Get Rs. 500</Text>
          <Text className="text-white/80 text-xs font-sans-medium leading-5 mt-2">
            Give your friends Rs. 250 discount off their first booking. You will get Rs. 500 worth of loyalty points
            (5000 points) the moment they complete their first service!
          </Text>
        </View>

        {/* 2. Referral Code Section */}
        <View style={cardShadow} className="rounded-xl border border-gray-200 bg-white p-5 mb-5 items-center">
          <Text className="text-xs font-sans-bold text-gray-400 uppercase tracking-wider mb-2">Your Referral Code</Text>

          <View className="flex-row items-center justify-between w-full border border-dashed border-primary/30 bg-primary/5 rounded-xl px-4 py-3.5 mb-4">
            <Text className="text-lg font-sans-extrabold text-primary tracking-widest">{referralCode}</Text>
            <Pressable
              onPress={handleCopyCode}
              className={`flex-row items-center px-3 py-1.5 rounded-lg ${copied ? 'bg-emerald-500' : 'bg-primary'}`}
            >
              <Feather name={copied ? 'check' : 'copy'} size={12} color="#ffffff" />
              <Text className="text-xs font-sans-semibold text-white ml-1.5">{copied ? 'Copied' : 'Copy'}</Text>
            </Pressable>
          </View>

          <Button
            title="Share Referral Invite"
            onPress={handleShare}
            className="w-full h-12"
            variant="primary"
            leftIcon={<Feather name="share-2" size={16} color="#ffffff" />}
          />
        </View>

        {/* 3. How it Works */}
        <Text className="text-sm font-sans-bold text-gray-900 mb-3 ml-1">How it Works</Text>
        <View className="gap-y-4 mb-5">
          <View className="flex-row items-start">
            <View className="h-8 w-8 rounded-full bg-primary/10 items-center justify-center mr-3 mt-0.5">
              <Feather name="send" size={14} color="#485aff" />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-sans-bold text-gray-900 leading-4">1. Send Invitation</Text>
              <Text className="text-[11px] font-sans-medium text-gray-400 mt-1 leading-4">
                Share your unique referral code with friends via SMS, Email, or Social Media.
              </Text>
            </View>
          </View>

          <View className="flex-row items-start">
            <View className="h-8 w-8 rounded-full bg-primary/10 items-center justify-center mr-3 mt-0.5">
              <Feather name="gift" size={14} color="#485aff" />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-sans-bold text-gray-900 leading-4">2. Friend Completes Booking</Text>
              <Text className="text-[11px] font-sans-medium text-gray-400 mt-1 leading-4">
                Your friend registers using your code and gets a flat Rs. 250 off their first booking.
              </Text>
            </View>
          </View>

          <View className="flex-row items-start">
            <View className="h-8 w-8 rounded-full bg-primary/10 items-center justify-center mr-3 mt-0.5">
              <Feather name="award" size={14} color="#485aff" />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-sans-bold text-gray-900 leading-4">3. Get Rewarded!</Text>
              <Text className="text-[11px] font-sans-medium text-gray-400 mt-1 leading-4">
                You receive 5,000 points (Rs. 500) added directly to your Sewalo rewards balance.
              </Text>
            </View>
          </View>
        </View>

        {/* 4. Referral Statistics */}
        <Text className="text-sm font-sans-bold text-gray-900 mb-3 ml-1">Your Referrals History</Text>
        <View className="flex-row gap-x-3">
          <View style={cardShadow} className="flex-1 bg-white border border-gray-200 rounded-xl p-4 items-center">
            <Text className="text-[10px] font-sans-semibold text-gray-400 uppercase">Successful</Text>
            <Text className="text-lg font-sans-extrabold text-gray-900 mt-1">3</Text>
            <Text className="text-[10px] font-sans-medium text-emerald-500 mt-1">Rs. 1,500 Earned</Text>
          </View>

          <View style={cardShadow} className="flex-1 bg-white border border-gray-200 rounded-xl p-4 items-center">
            <Text className="text-[10px] font-sans-semibold text-gray-400 uppercase">In Progress</Text>
            <Text className="text-lg font-sans-extrabold text-gray-900 mt-1">1</Text>
            <Text className="text-[10px] font-sans-medium text-amber-500 mt-1">Rs. 500 Pending</Text>
          </View>
        </View>
      </ContentLayout>
    </View>
  );
}
