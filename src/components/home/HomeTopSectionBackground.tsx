import React, { memo } from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';

import { ILLUSTRATION } from '@/constants/images';

interface HomeTopSectionBackgroundProps {
  height: number;
}

function HomeTopSectionBackground({ height }: HomeTopSectionBackgroundProps) {
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: -24, right: -24, bottom: 0, opacity: 0.78 }}>
      <Image source={ILLUSTRATION.backgroundVector} contentFit="fill" style={{ height, width: '100%' }} />
    </View>
  );
}

export default memo(HomeTopSectionBackground);
