import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import EmptyStateCard from '@/components/common/EmptyStateCard';

interface EmptyFavouritesStateProps {
  title?: string;
  description?: string;
}

export default function EmptyFavouritesState({ title, description }: EmptyFavouritesStateProps) {
  const { t } = useTranslation();
  const displayTitle = title || t('customer.emptyFavouritesTitle');
  const displayDescription = description || t('customer.emptyFavouritesDesc');

  const FavouritesIcon = (
    <Svg width={126} height={96} viewBox="0 0 126 96">
      <Rect x="19" y="14" width="88" height="68" rx="14" fill="#fef2f2" />
      <Rect x="25" y="20" width="76" height="56" rx="10" fill="#ffffff" />
      <Rect x="35" y="32" width="22" height="6" rx="3" fill="#fee2e2" />
      <Rect x="35" y="44" width="56" height="6" rx="3" fill="#f8fafc" />
      <Rect x="35" y="56" width="38" height="6" rx="3" fill="#f8fafc" />
      <Circle cx="98" cy="26" r="14" fill="#ef4444" />
      <Path d="M98 31s-5-2.7-5-5.5a2.5 2.5 0 0 1 4.5-1.5 2.5 2.5 0 0 1 4.5 1.5c0 2.8-5 5.5-5 5.5z" fill="#ffffff" />
      <Circle cx="18" cy="68" r="8" fill="#f1f5f9" />
    </Svg>
  );

  return <EmptyStateCard icon={FavouritesIcon} title={displayTitle} description={displayDescription} />;
}
