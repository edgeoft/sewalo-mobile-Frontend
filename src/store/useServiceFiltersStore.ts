import { create } from 'zustand';
import { SERVICE_SORT } from '@/constants/services';

export interface ServiceFiltersState {
  searchQuery: string;
  selectedCategorySlug: string | undefined;
  minPrice: string;
  maxPrice: string;
  minRating: string;
  serviceLocation: string;
  radius: string;
  sortBy: string;
  setSearchQuery: (query: string) => void;
  setSelectedCategorySlug: (slug: string | undefined) => void;
  setFilters: (filters: {
    minPrice?: string;
    maxPrice?: string;
    minRating?: string;
    serviceLocation?: string;
    radius?: string;
    sortBy?: string;
  }) => void;
  resetFilters: () => void;
  clearAll: () => void;
}

const initialFilters = {
  searchQuery: '',
  selectedCategorySlug: undefined,
  minPrice: '',
  maxPrice: '',
  minRating: '',
  serviceLocation: '',
  radius: '25',
  sortBy: SERVICE_SORT.ALPHABETICAL,
};

export const useServiceFiltersStore = create<ServiceFiltersState>()((set) => ({
  ...initialFilters,
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedCategorySlug: (selectedCategorySlug) => set({ selectedCategorySlug }),
  setFilters: (filters) => set(filters),
  resetFilters: () =>
    set({
      minPrice: '',
      maxPrice: '',
      minRating: '',
      serviceLocation: '',
      radius: '25',
      sortBy: SERVICE_SORT.ALPHABETICAL,
    }),
  clearAll: () => set(initialFilters),
}));
