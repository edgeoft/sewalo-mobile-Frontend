import { create } from 'zustand';

export interface ServiceFiltersState {
  searchQuery: string;
  selectedCategorySlug: string | undefined;
  minPrice: string;
  maxPrice: string;
  minRating: string;
  serviceLocation: string;
  radius: string;
  setSearchQuery: (query: string) => void;
  setSelectedCategorySlug: (slug: string | undefined) => void;
  setFilters: (filters: {
    minPrice?: string;
    maxPrice?: string;
    minRating?: string;
    serviceLocation?: string;
    radius?: string;
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
    }),
  clearAll: () => set(initialFilters),
}));
