export const SERVICE_LOCATIONS = {
  Fixed: 'fixed_location',
  Remote: 'remote_location',
  Customer: 'customer_location',
} as const;

export const DELIVERY_TYPES = {
  Fixed: 'fixed',
  Remote: 'remote',
  Customer: 'at_customer',
} as const;

export enum SERVICE_SORT {
  ALPHABETICAL = 'alphabetical',
  NAME_DESC = 'name_desc',
  TOP_RATED = 'top_rated',
}

export const SERVICES_CONFIG = {
  PAGE_SIZE: 20,
  DEFAULT_PAGE: 1,
  DEFAULT_RADIUS: 25,
} as const;

export const SORT_OPTIONS = [
  { value: SERVICE_SORT.ALPHABETICAL, labelKey: 'services.sortAlphabetical' },
  { value: SERVICE_SORT.NAME_DESC, labelKey: 'services.sortNameDesc' },
  { value: SERVICE_SORT.TOP_RATED, labelKey: 'services.sortTopRated' },
] as const;
