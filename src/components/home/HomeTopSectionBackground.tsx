import { Image, View } from 'react-native';

import { ILLUSTRATION } from '@/constants/images';

interface HomeTopSectionBackgroundProps {
  height: number;
}

export default function HomeTopSectionBackground({ height }: HomeTopSectionBackgroundProps) {
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: -24, right: -24, bottom: 0, opacity: 0.78 }}>
      <Image source={ILLUSTRATION.backgroundVector} resizeMode="stretch" style={{ height, width: '100%' }} />
    </View>
  );
}
