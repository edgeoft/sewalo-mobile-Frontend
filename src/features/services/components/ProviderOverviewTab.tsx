import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface ProviderOverviewTabProps {
  bio: string;
  experience: string;
  languages: string[];
  skills: string[];
}

export default function ProviderOverviewTab({ bio, experience, languages, skills }: ProviderOverviewTabProps) {
  return (
    <View className="gap-y-4">
      {/* About Bio Section */}
      <View className="bg-white border border-gray-200 rounded-lg p-4" style={styles.shadowMin}>
        <Text className="text-sm font-sans-bold text-gray-950 mb-2">About Provider</Text>
        <Text className="text-xs font-sans-medium text-gray-500 leading-5">{bio}</Text>
      </View>

      {/* Experience & Languages */}
      <View className="bg-white border border-gray-200 rounded-lg p-4" style={styles.shadowMin}>
        <View className="flex-row items-center gap-2 mb-3">
          <Feather name="briefcase" size={14} color="#485aff" />
          <Text className="text-xs font-sans-bold text-gray-900">{experience}</Text>
        </View>

        <View className="flex-row items-center gap-2">
          <Feather name="globe" size={14} color="#485aff" />
          <Text className="text-xs font-sans-bold text-gray-900">Languages:</Text>
          <Text className="text-xs font-sans-medium text-gray-500">{languages.join(', ')}</Text>
        </View>
      </View>

      {/* Skills Tag List */}
      <View className="bg-white border border-gray-200 rounded-lg p-4" style={styles.shadowMin}>
        <Text className="text-sm font-sans-bold text-gray-950 mb-3">Skills & Expertise</Text>
        <View className="flex-row flex-wrap gap-2">
          {skills.map((skill) => (
            <View key={skill} className="bg-gray-100 rounded-lg px-2.5 py-1">
              <Text className="text-xs font-sans-medium text-gray-600">{skill}</Text>
            </View>
          ))}
        </View>
      </View>
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
