import { useCallback, useRef, useState } from 'react';
import { Animated, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

export interface UseScrollOptions {
  threshold?: number;
}

export function useScroll(options?: UseScrollOptions) {
  const threshold = options?.threshold ?? 10;
  const [scrollYAnimated] = useState(() => new Animated.Value(0));
  const [isScrolled, setIsScrolled] = useState(false);
  const isScrolledRef = useRef(false);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = event.nativeEvent.contentOffset.y;
      scrollYAnimated.setValue(y);

      const nextIsScrolled = y > threshold;
      if (nextIsScrolled !== isScrolledRef.current) {
        isScrolledRef.current = nextIsScrolled;
        setIsScrolled(nextIsScrolled);
      }
    },
    [threshold, scrollYAnimated],
  );

  return {
    scrollYAnimated,
    isScrolled,
    handleScroll,
  };
}
