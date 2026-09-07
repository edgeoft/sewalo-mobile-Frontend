import { useCallback, useMemo, useState } from 'react';
import { SERVICE_SORT } from '@/constants/services';
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
  const sortByStore = useServiceFiltersStore((s) => s.sortBy);
  const setFilters = useServiceFiltersStore((s) => s.setFilters);
  const resetFiltersStore = useServiceFiltersStore((s) => s.resetFilters);

  const [minPrice, setMinPrice] = useState(minPriceStore);
  const [maxPrice, setMaxPrice] = useState(maxPriceStore);
  const [minRating, setMinRating] = useState(minRatingStore);
  const [serviceLocation, setServiceLocation] = useState(serviceLocationStore);
  const [radius, setRadius] = useState(radiusStore);
  const [sortBy, setSortBy] = useState(sortByStore);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const handleApplyFilters = useCallback(() => {
    setFilters({
      minPrice,
      maxPrice,
      minRating,
      serviceLocation,
      radius,
      sortBy,
    });
    setIsFilterModalOpen(false);
  }, [setFilters, minPrice, maxPrice, minRating, serviceLocation, radius, sortBy]);

  const handleResetFilters = useCallback(() => {
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setServiceLocation('');
    setRadius('25');
    setSortBy(SERVICE_SORT.ALPHABETICAL);
    resetFiltersStore();
    setIsFilterModalOpen(false);
  }, [resetFiltersStore]);

  const activeFiltersCount = useMemo(() => {
    const isSortCustom = sortByStore && sortByStore !== SERVICE_SORT.ALPHABETICAL;
    return (
      [minPriceStore, maxPriceStore, minRatingStore, serviceLocationStore].filter(Boolean).length +
      (isSortCustom ? 1 : 0)
    );
  }, [minPriceStore, maxPriceStore, minRatingStore, serviceLocationStore, sortByStore]);

  return {
    // store values (committed)
    minPriceStore,
    maxPriceStore,
    minRatingStore,
    serviceLocationStore,
    radiusStore,
    sortByStore,
    // draft values (modal editing)
    minPrice,
    maxPrice,
    minRating,
    serviceLocation,
    radius,
    sortBy,
    setMinPrice,
    setMaxPrice,
    setMinRating,
    setServiceLocation,
    setRadius,
    setSortBy,
    isFilterModalOpen,
    setIsFilterModalOpen,
    handleApplyFilters,
    handleResetFilters,
    activeFiltersCount,
  };
}
