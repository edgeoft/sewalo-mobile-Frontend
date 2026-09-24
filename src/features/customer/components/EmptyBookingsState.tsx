import React from 'react';
import { THEME_COLORS } from '@/constants/colors';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import EmptyStateCard from '@/components/common/EmptyStateCard';

interface EmptyBookingsStateProps {
  title?: string;
  description?: string;
}

export default function EmptyBookingsState({ title, description }: EmptyBookingsStateProps) {
  const { t } = useTranslation();
  const displayTitle = title || t('customer.emptyBookingsTitle');
  const displayDescription = description || t('customer.emptyBookingsDesc');

  const BookingsIcon = (
    <Svg width={126} height={96} viewBox="0 0 126 96">
      <Rect x="19" y="14" width="88" height="68" rx="14" fill="#eef2ff" />
      <Rect x="25" y="20" width="76" height="56" rx="10" fill="#ffffff" />
      <Rect x="33" y="30" width="28" height="6" rx="3" fill="#dbe3ff" />
      <Rect x="33" y="42" width="60" height="6" rx="3" fill="#edf0f6" />
      <Rect x="33" y="54" width="45" height="6" rx="3" fill="#edf0f6" />
      <Circle cx="98" cy="26" r="12" fill={THEME_COLORS.primary} />
      <Path d="M93 26h10" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
      <Circle cx="18" cy="68" r="10" fill="#f1f5f9" />
      <Path d="M15 68h6" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" />
      <Path d="M50 10c3-3 8-3 11 0" stroke="#bfc8ff" strokeWidth="2" strokeLinecap="round" fill="none" />
    </Svg>
  );

  return <EmptyStateCard icon={BookingsIcon} title={displayTitle} description={displayDescription} />;
}
