import { useCallback, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { SERVICE_SORT } from '@/constants/services';
import { useServiceFiltersStore } from '@/store/useServiceFiltersStore';

interface DraftFilters {
  minPrice: string;
  maxPrice: string;
  minRating: string;
  serviceLocation: string;
  radius: string;
  sortBy: string;
}

const DEFAULT_DRAFT_FILTERS: DraftFilters = {
  minPrice: '',
  maxPrice: '',
  minRating: '',
  serviceLocation: '',
  radius: '25',
  sortBy: SERVICE_SORT.ALPHABETICAL,
};

/**
 * Draft lifecycle for the service-filter modal, shared by Find/Map screens.
 * Seeds a local draft from the persisted store; Apply commits, Reset clears both.
 */
export function useServiceFilters() {
  const {
    minPriceStore,
    maxPriceStore,
    minRatingStore,
    serviceLocationStore,
    radiusStore,
    sortByStore,
    setFilters,
    resetFiltersStore,
  } = useServiceFiltersStore(
    useShallow((s) => ({
      minPriceStore: s.minPrice,
      maxPriceStore: s.maxPrice,
      minRatingStore: s.minRating,
      serviceLocationStore: s.serviceLocation,
      radiusStore: s.radius,
      sortByStore: s.sortBy,
      setFilters: s.setFilters,
      resetFiltersStore: s.resetFilters,
    })),
  );

  const [draft, setDraft] = useState<DraftFilters>(() => ({
    minPrice: minPriceStore,
    maxPrice: maxPriceStore,
    minRating: minRatingStore,
    serviceLocation: serviceLocationStore,
    radius: radiusStore,
    sortBy: sortByStore,
  }));
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const setMinPrice = useCallback((minPrice: string) => setDraft((d) => ({ ...d, minPrice })), []);
  const setMaxPrice = useCallback((maxPrice: string) => setDraft((d) => ({ ...d, maxPrice })), []);
  const setMinRating = useCallback((minRating: string) => setDraft((d) => ({ ...d, minRating })), []);
  const setServiceLocation = useCallback((serviceLocation: string) => setDraft((d) => ({ ...d, serviceLocation })), []);
  const setRadius = useCallback((radius: string) => setDraft((d) => ({ ...d, radius })), []);
  const setSortBy = useCallback((sortBy: string) => setDraft((d) => ({ ...d, sortBy })), []);

  const handleApplyFilters = useCallback(() => {
    setFilters(draft);
    setIsFilterModalOpen(false);
  }, [setFilters, draft]);

  const handleResetFilters = useCallback(() => {
    setDraft(DEFAULT_DRAFT_FILTERS);
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
    minPrice: draft.minPrice,
    maxPrice: draft.maxPrice,
    minRating: draft.minRating,
    serviceLocation: draft.serviceLocation,
    radius: draft.radius,
    sortBy: draft.sortBy,
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
