import { useCallback, useMemo, useState } from 'react';

import { useServiceFiltersStore } from '@/store/useServiceFiltersStore';

/**
 * Draft lifecycle for the service-filter modal, shared by Find/Map screens.
 * Seeds a local draft from the persisted store; Apply commits, Reset clears both.
 */
export function useServiceFilters() {
  const minPriceStore = useServiceFiltersStore((s) => s.minPrice);
  const maxPriceStore = useServiceFiltersStore((s) => s.maxPrice);
  const minRatingStore = useServiceFiltersStore((s) => s.minRating);
  const serviceLocationStore = useServiceFiltersStore((s) => s.serviceLocation);
  const radiusStore = useServiceFiltersStore((s) => s.radius);
  const setFilters = useServiceFiltersStore((s) => s.setFilters);
  const resetFiltersStore = useServiceFiltersStore((s) => s.resetFilters);

  const [minPrice, setMinPrice] = useState(minPriceStore);
  const [maxPrice, setMaxPrice] = useState(maxPriceStore);
  const [minRating, setMinRating] = useState(minRatingStore);
  const [serviceLocation, setServiceLocation] = useState(serviceLocationStore);
  const [radius, setRadius] = useState(radiusStore);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const handleApplyFilters = useCallback(() => {
    setFilters({
      minPrice,
      maxPrice,
      minRating,
      serviceLocation,
      radius,
    });
    setIsFilterModalOpen(false);
  }, [setFilters, minPrice, maxPrice, minRating, serviceLocation, radius]);

  const handleResetFilters = useCallback(() => {
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setServiceLocation('');
    setRadius('25');
    resetFiltersStore();
    setIsFilterModalOpen(false);
  }, [resetFiltersStore]);

  const activeFiltersCount = useMemo(
    () => [minPriceStore, maxPriceStore, minRatingStore, serviceLocationStore].filter(Boolean).length,
    [minPriceStore, maxPriceStore, minRatingStore, serviceLocationStore],
  );

  return {
    // store values (committed)
    minPriceStore,
    maxPriceStore,
    minRatingStore,
    serviceLocationStore,
    radiusStore,
    // draft values (modal editing)
    minPrice,
    maxPrice,
    minRating,
    serviceLocation,
    radius,
    setMinPrice,
    setMaxPrice,
    setMinRating,
    setServiceLocation,
    setRadius,
    isFilterModalOpen,
    setIsFilterModalOpen,
    handleApplyFilters,
    handleResetFilters,
    activeFiltersCount,
  };
}
