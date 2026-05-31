import { useCallback, useState } from 'react';
import { Animated, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

export interface UseScrollOptions {
  threshold?: number;
}

export function useScroll(options?: UseScrollOptions) {
  const threshold = options?.threshold ?? 10;
  const [scrollY, setScrollY] = useState(0);
  const [scrollYAnimated] = useState(() => new Animated.Value(0));

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = event.nativeEvent.contentOffset.y;
      setScrollY(y);
      scrollYAnimated.setValue(y);
    },
    [scrollYAnimated],
  );

  const isScrolled = scrollY > threshold;

  return {
    scrollY,
    scrollYAnimated,
    isScrolled,
    handleScroll,
  };
}
