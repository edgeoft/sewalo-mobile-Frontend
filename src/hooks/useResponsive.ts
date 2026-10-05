import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { BREAKPOINTS, SPACING } from '@/constants/layout';

export interface ResponsiveInfo {
  width: number;
  height: number;
  isCompact: boolean;
  isRegular: boolean;
  isTablet: boolean;
  pagePadding: number;
  maxContentWidth: number;
}

/**
 * Hook to provide centralized responsive metrics across mobile devices.
 */
export function useResponsive(): ResponsiveInfo {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const isCompact = width < BREAKPOINTS.compact;
    const isTablet = width >= BREAKPOINTS.large;
    const isRegular = !isCompact && !isTablet;

    const pagePadding = isTablet ? SPACING.pagePaddingTablet : SPACING.pagePadding;
    const maxContentWidth = isTablet ? 640 : width;

    return {
      width,
      height,
      isCompact,
      isRegular,
      isTablet,
      pagePadding,
      maxContentWidth,
    };
  }, [width, height]);
}
