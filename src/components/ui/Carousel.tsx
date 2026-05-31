import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleProp,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';

export interface CarouselProps<T> {
  data: T[];
  renderItem: (info: { item: T; index: number; cardWidth: number }) => React.ReactElement;
  keyExtractor?: (item: T, index: number) => string;
  gap?: number;
  autoplay?: boolean;
  autoplayInterval?: number;
  loop?: boolean;
  showsHorizontalScrollIndicator?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export default function Carousel<T>({
  data,
  renderItem,
  keyExtractor,
  gap = 16,
  autoplay = false,
  autoplayInterval = 3000,
  loop = true,
  showsHorizontalScrollIndicator = false,
  contentContainerStyle,
}: CarouselProps<T>) {
  const { width: windowWidth } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  // Track active index based on rendered array size
  const hasMultipleItems = data.length > 1;
  const isInfinite = loop && hasMultipleItems;
  const activeIndexRef = useRef(isInfinite ? 1 : 0);

  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInteractingRef = useRef(false);

  const cardWidth = containerWidth > 0 ? containerWidth : windowWidth - 48; // default to screen width minus horizontal layout padding

  // Prepare data with clone items if circular looping is active
  const renderedData = isInfinite ? [data[data.length - 1], ...data, data[0]] : data;

  const stopAutoplay = useCallback(() => {
    if (autoplayTimerRef.current) {
      clearInterval(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    }
  }, []);

  const startAutoplay = useCallback(() => {
    if (!autoplay || !hasMultipleItems) return;

    stopAutoplay();

    autoplayTimerRef.current = setInterval(() => {
      if (isInteractingRef.current) return;

      const nextIndex = activeIndexRef.current + 1;
      activeIndexRef.current = nextIndex;

      scrollRef.current?.scrollTo({
        x: nextIndex * (cardWidth + gap),
        animated: true,
      });
    }, autoplayInterval);
  }, [autoplay, autoplayInterval, hasMultipleItems, cardWidth, gap, stopAutoplay]);

  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  }, [startAutoplay, stopAutoplay]);

  // Adjust scroll position after layout to align with item at index 1 if infinite looping is on
  const handleLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    setContainerWidth(width);
    if (isInfinite) {
      // Scroll to index 1 (the first real item) silently
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          x: 1 * (width + gap),
          animated: false,
        });
        activeIndexRef.current = 1;
      }, 50);
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / (cardWidth + gap));
    activeIndexRef.current = index;
  };

  const handleScrollBeginDrag = () => {
    isInteractingRef.current = true;
  };

  // Perform silent jump at boundary clone indices
  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    isInteractingRef.current = false;
    if (!isInfinite) return;

    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / (cardWidth + gap));

    if (index === 0) {
      // Silently jump to the last real item (index N)
      activeIndexRef.current = data.length;
      scrollRef.current?.scrollTo({
        x: data.length * (cardWidth + gap),
        animated: false,
      });
    } else if (index === data.length + 1) {
      // Silently jump to the first real item (index 1)
      activeIndexRef.current = 1;
      scrollRef.current?.scrollTo({
        x: 1 * (cardWidth + gap),
        animated: false,
      });
    }
  };

  return (
    <View onLayout={handleLayout} className="w-full">
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
        snapToInterval={cardWidth + gap}
        snapToAlignment="start"
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEnd}
        onMomentumScrollEnd={handleScrollEnd}
        contentContainerStyle={[{ gap, paddingRight: 4 }, contentContainerStyle]}
      >
        {renderedData.map((item, index) => {
          // Adjust real index mapping for keys
          const originalIndex = isInfinite
            ? index === 0
              ? data.length - 1
              : index === data.length + 1
                ? 0
                : index - 1
            : index;

          const baseKey = keyExtractor ? keyExtractor(item, originalIndex) : `${originalIndex}`;

          const key = `${baseKey}-${index}`;

          return (
            <View key={key} style={{ width: cardWidth }}>
              {renderItem({ item, index: originalIndex, cardWidth })}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
