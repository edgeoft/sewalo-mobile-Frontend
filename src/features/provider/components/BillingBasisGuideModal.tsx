import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface BillingBasisGuideModalProps {
  visible: boolean;
  onClose: () => void;
}

interface GuideItemProps {
  number: number;
  title: string;
  whatItMeans: string;
  bestFor: string;
  examples: string;
}

function GuideItem({ number, title, whatItMeans, bestFor, examples }: GuideItemProps) {
  return (
    <View className="mb-6">
      <Text className="text-xs font-sans-bold text-gray-900 mb-1.5">
        {number}. {title}
      </Text>

      <View className="pl-0.5 gap-y-1">
        <Text className="text-[11px] font-sans-medium text-gray-600 leading-normal">
          <Text className="font-sans-bold text-gray-800">What it means: </Text>
          {whatItMeans}
        </Text>

        <Text className="text-[11px] font-sans-medium text-gray-600 leading-normal">
          <Text className="font-sans-bold text-gray-800">Best for: </Text>
          {bestFor}
        </Text>

        <Text className="text-[11px] font-sans-medium text-gray-600 leading-normal">
          <Text className="font-sans-bold text-gray-800">Examples: </Text>
          {examples}
        </Text>
      </View>
    </View>
  );
}

export default function BillingBasisGuideModal({ visible, onClose }: BillingBasisGuideModalProps) {
  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay} className="flex-1 bg-black/40 justify-end">
        <View className="bg-white rounded-t-3xl overflow-hidden" style={{ height: '80%' }}>
          {/* Header */}
          <View className="px-6 pt-6 pb-4 border-b border-gray-100 flex-row justify-between items-start">
            <View className="flex-1 mr-4">
              <Text className="text-base font-sans-extrabold text-gray-950">
                Quick Guide: How to Choose Your Billing Basis
              </Text>
              <Text className="text-[11px] font-sans-medium text-gray-400 mt-1">
                Choose the option that best fits how you work and charge.
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={8}
              className="h-8 w-8 bg-gray-50 rounded-full items-center justify-center active:bg-gray-100"
            >
              <Feather name="x" size={18} color="#64748b" />
            </Pressable>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            className="px-6 py-5"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            <GuideItem
              number={1}
              title="Per Service"
              whatItMeans="You charge a flat rate for a standard, routine appointment. Every customer gets exactly the same experience."
              bestFor="Beauty & Personal Care, Fitness Sessions, Legal Services"
              examples="Haircut, 1-Hour Massage, Yoga Class."
            />

            <GuideItem
              number={2}
              title="Per Job"
              whatItMeans="You charge one flat price to finish a specific physical task, regardless of exactly how many minutes it takes."
              bestFor="Basic Plumbing, Electrical, Simple Repairs."
              examples="Tap Installation, Ceiling Fan Fitting, Water Tank Cleaning."
            />

            <GuideItem
              number={3}
              title="Fixed Total Price"
              whatItMeans="You guarantee an exact, unchangeable price for a strict package of work. There are no surprise fees."
              bestFor="Tuition, Standardized IT Repair, Nutrition Plans."
              examples="1 Month Math Tuition, Laptop Formatting, 30-Day Diet Plan."
            />

            <GuideItem
              number={4}
              title="Per Project"
              whatItMeans="You charge for a larger, multi-step creative or technical effort that takes days or weeks to complete."
              bestFor="Design, Marketing, Custom IT Development."
              examples="Logo Design, Website Development, Promotional Video."
            />

            <GuideItem
              number={5}
              title="Starting At"
              whatItMeans="You set a base minimum price because the job is unpredictable. If extra work, time, or parts are needed, you get the customer's approval and add the extra charges to the final bill."
              bestFor="Moving, Complex Repairs, Event Shoots."
              examples="Home Shifting, Pipe Leakage Fix, Wedding Photography."
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
});
