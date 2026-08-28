type QueryParams = unknown;

export const QUERY_KEYS = {
  PROFILE: ['profile'],
  BOOKINGS: {
    ALL: ['bookings'],
    LIST: (params?: QueryParams) => ['bookings', params] as const,
    MY: (params?: QueryParams) => ['my-bookings', params] as const,
    DETAIL: (id: string) => ['booking', id] as const,
    BASE: ['booking'],
  },
  APPLICABLE_COUPONS: (bookingId?: string) => ['applicable-coupons', bookingId] as const,
  MY_RATINGS: {
    ALL: ['my-ratings'],
    LIST: (params?: QueryParams) => ['my-ratings', params] as const,
  },
  PROVIDER_RATINGS: (providerId: string, params?: { page?: number; limit?: number }) =>
    ['provider-ratings', providerId, params ?? {}] as const,
  BLOGS: {
    LIST: (params?: QueryParams) => ['blogs', params] as const,
    FEATURED: ['featured-blog'],
    DETAIL: (slug: string) => ['blog', slug] as const,
    CATEGORIES: ['blog-categories'],
  },
  CATEGORIES: {
    ALL: (show?: string) => ['categories', show] as const,
  },
  NOTIFICATIONS: {
    LIST: (params?: QueryParams) => ['notifications', params] as const,
    ALL: ['notifications'],
    UNREAD_COUNT: ['notification-unread-count'],
  },
  COMMISSION_SUMMARY: ['commission-summary'],
  COMMISSIONS: (params?: QueryParams) => ['commissions', params] as const,
  PROVIDER_DASHBOARD_STATS: ['provider-dashboard-stats'],
  EARNING_SUMMARY: ['earning-summary'],
  MY_TRANSACTIONS: (page: number, limit: number) => ['my-transactions', page, limit] as const,
  FINANCE_ACCOUNTS: ['financeAccounts'],
  PROVIDER_CATEGORIES: ['categories'],
  PROVIDER_SUBCATEGORIES: (slug: string) => ['subcategories', slug] as const,
  MY_SERVICES: ['my-services'],
  REFERRAL_CODE: ['referral-code'],
  REFERRAL_STATS: ['referral-stats'],
  FAVOURITES_LIST: {
    ALL: ['favourites-list'],
    LIST: (page: number, limit: number) => ['favourites-list', page, limit] as const,
  },
  SERVICE_LIST: {
    ALL: ['service-list'],
    LIST: (params?: QueryParams) => ['service-list', params] as const,
  },
  PROVIDER_DETAILS: {
    ALL: ['provider-details'],
    DETAIL: (id: string) => ['provider-details', id] as const,
  },
  PROVIDERS_NEARBY: {
    ALL: ['providers-nearby'],
    LIST: (params?: QueryParams) => ['providers-nearby', params] as const,
  },
} as const;
