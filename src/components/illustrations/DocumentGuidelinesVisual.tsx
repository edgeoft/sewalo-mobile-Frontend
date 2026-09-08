import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Rect, Circle, Path, G, Line } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { THEME_COLORS } from '@/constants/colors';

export default function DocumentGuidelinesVisual() {
  const { t } = useTranslation();

  return (
    <View style={{ borderRadius: 10 }} className="rounded-lg border border-gray-200 bg-white p-4 mb-6">
      <View className="flex-row items-center mb-1">
        <Feather name="file-text" size={15} color={THEME_COLORS.primary} />
        <Text className="text-sm font-sans-bold text-gray-950 ml-2">{t('components.verificationGuidelines')}</Text>
      </View>
      <Text className="text-xs font-sans-medium text-gray-500 mb-4 leading-5">
        {t('components.verificationGuidelinesDesc')}
      </Text>

      {/* Visual Good vs Avoid Comparison Cards */}
      <View className="flex-row gap-3 mb-5">
        {/* Correct Card */}
        <View
          style={{ borderRadius: 10 }}
          className="flex-1 rounded-lg bg-emerald-50/60 border border-emerald-200/80 p-3 items-center"
        >
          <View className="h-16 w-24 items-center justify-center mb-2">
            <Svg width="96" height="60" viewBox="0 0 96 60" fill="none">
              {/* Card outline */}
              <Rect
                x="8"
                y="6"
                width="80"
                height="48"
                rx="4"
                fill={THEME_COLORS.primaryForeground}
                stroke={THEME_COLORS.slate300}
                strokeWidth="1.2"
              />
              {/* Corner framing brackets */}
              <Path
                d="M 4 12 L 4 4 L 12 4"
                stroke={THEME_COLORS.emeraldSuccess}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <Path
                d="M 92 12 L 92 4 L 84 4"
                stroke={THEME_COLORS.emeraldSuccess}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <Path
                d="M 4 48 L 4 56 L 12 56"
                stroke={THEME_COLORS.emeraldSuccess}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <Path
                d="M 92 48 L 92 56 L 84 56"
                stroke={THEME_COLORS.emeraldSuccess}
                strokeWidth="1.5"
                strokeLinecap="round"
              />

              {/* Photo placeholder */}
              <Rect x="14" y="14" width="20" height="24" rx="3" fill={THEME_COLORS.surfaceIndigoSubtle} />
              <Circle cx="24" cy="22" r="4.5" fill={THEME_COLORS.primary} opacity={0.6} />
              <Path d="M 17 35 C 17 30 20 28 24 28 C 28 28 31 30 31 35 Z" fill={THEME_COLORS.primary} opacity={0.6} />

              {/* Text lines */}
              <Line
                x1="40"
                y1="18"
                x2="76"
                y2="18"
                stroke={THEME_COLORS.slate700}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <Line
                x1="40"
                y1="26"
                x2="68"
                y2="26"
                stroke={THEME_COLORS.slate400}
                strokeWidth="2"
                strokeLinecap="round"
              />
              <Line
                x1="40"
                y1="33"
                x2="72"
                y2="33"
                stroke={THEME_COLORS.slate300}
                strokeWidth="1.8"
                strokeLinecap="round"
              />

              {/* Success badge */}
              <Circle cx="80" cy="12" r="7" fill={THEME_COLORS.emeraldSuccess} />
              <Path
                d="M 77 12 L 79 14 L 83 10"
                stroke={THEME_COLORS.primaryForeground}
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
          <Text className="text-[11px] font-sans-bold text-emerald-800">{t('components.guidelineCorrect')}</Text>
          <Text className="text-[10px] font-sans-medium text-emerald-700/80 text-center mt-0.5">
            {t('components.guidelineCorrectDesc')}
          </Text>
        </View>

        {/* Avoid Card */}
        <View
          style={{ borderRadius: 10 }}
          className="flex-1 rounded-lg bg-rose-50/60 border border-rose-200/80 p-3 items-center"
        >
          <View className="h-16 w-24 items-center justify-center mb-2">
            <Svg width="96" height="60" viewBox="0 0 96 60" fill="none">
              {/* Cropped / cut off card */}
              <G transform="rotate(-4 48 30)">
                <Rect
                  x="4"
                  y="8"
                  width="78"
                  height="46"
                  rx="4"
                  fill={THEME_COLORS.primaryForeground}
                  stroke={THEME_COLORS.slate300}
                  strokeWidth="1.2"
                />
                {/* Blurry lines */}
                <Line
                  x1="36"
                  y1="20"
                  x2="70"
                  y2="20"
                  stroke={THEME_COLORS.slate300}
                  strokeWidth="2.5"
                  strokeDasharray="2 3"
                  strokeLinecap="round"
                />
                <Line
                  x1="36"
                  y1="28"
                  x2="62"
                  y2="28"
                  stroke={THEME_COLORS.slate200}
                  strokeWidth="2"
                  strokeDasharray="2 3"
                  strokeLinecap="round"
                />
                <Line
                  x1="36"
                  y1="35"
                  x2="66"
                  y2="35"
                  stroke={THEME_COLORS.slate200}
                  strokeWidth="1.8"
                  strokeDasharray="2 3"
                  strokeLinecap="round"
                />

                {/* Glare stripe */}
                <Path d="M 18 10 L 42 10 L 26 50 L 12 50 Z" fill={THEME_COLORS.amberStar} opacity={0.35} />
              </G>

              {/* Danger badge */}
              <Circle cx="80" cy="12" r="7" fill={THEME_COLORS.dangerRed} />
              <Path
                d="M 77 9 L 83 15 M 83 9 L 77 15"
                stroke={THEME_COLORS.primaryForeground}
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </Svg>
          </View>
          <Text className="text-[11px] font-sans-bold text-rose-800">{t('components.guidelineAvoid')}</Text>
          <Text className="text-[10px] font-sans-medium text-rose-700/80 text-center mt-0.5">
            {t('components.guidelineAvoidDesc')}
          </Text>
        </View>
      </View>

      {/* 4 Guidelines Checklist Items */}
      <View className="divide-y divide-gray-100">
        {/* Guideline 1: All 4 Corners */}
        <View className="flex-row items-start py-2.5">
          <View className="h-7 w-7 rounded-lg bg-surface-indigo-subtle items-center justify-center mr-3 mt-0.5 flex-shrink-0">
            <Feather name="maximize-2" size={13} color={THEME_COLORS.primary} />
          </View>
          <View className="flex-1">
            <Text className="text-xs font-sans-bold text-gray-900 leading-4">
              {t('components.guidelineCornersTitle')}
            </Text>
            <Text className="text-[11px] font-sans-medium text-gray-500 mt-0.5 leading-snug">
              {t('components.guidelineCornersDesc')}
            </Text>
          </View>
        </View>

        {/* Guideline 2: Sharp & Legible */}
        <View className="flex-row items-start py-2.5">
          <View className="h-7 w-7 rounded-lg bg-blue-50 items-center justify-center mr-3 mt-0.5 flex-shrink-0">
            <Feather name="eye" size={13} color={THEME_COLORS.infoBlue} />
          </View>
          <View className="flex-1">
            <Text className="text-xs font-sans-bold text-gray-900 leading-4">
              {t('components.guidelineLegibleTitle')}
            </Text>
            <Text className="text-[11px] font-sans-medium text-gray-500 mt-0.5 leading-snug">
              {t('components.guidelineLegibleDesc')}
            </Text>
          </View>
        </View>

        {/* Guideline 3: No Glare or Flash */}
        <View className="flex-row items-start py-2.5">
          <View className="h-7 w-7 rounded-lg bg-amber-50 items-center justify-center mr-3 mt-0.5 flex-shrink-0">
            <Feather name="zap-off" size={13} color={THEME_COLORS.amberStar} />
          </View>
          <View className="flex-1">
            <Text className="text-xs font-sans-bold text-gray-900 leading-4">
              {t('components.guidelineGlareTitle')}
            </Text>
            <Text className="text-[11px] font-sans-medium text-gray-500 mt-0.5 leading-snug">
              {t('components.guidelineGlareDesc')}
            </Text>
          </View>
        </View>

        {/* Guideline 4: Original Government ID */}
        <View className="flex-row items-start py-2.5">
          <View className="h-7 w-7 rounded-lg bg-emerald-50 items-center justify-center mr-3 mt-0.5 flex-shrink-0">
            <Feather name="credit-card" size={13} color={THEME_COLORS.emeraldSuccess} />
          </View>
          <View className="flex-1">
            <Text className="text-xs font-sans-bold text-gray-900 leading-4">
              {t('components.guidelineOriginalTitle')}
            </Text>
            <Text className="text-[11px] font-sans-medium text-gray-500 mt-0.5 leading-snug">
              {t('components.guidelineOriginalDesc')}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
