export const USER_ROLES = {
  Customer: 'customer',
  Provider: 'provider',
  Guest: 'guest',
} as const;

export const USER_STATUSES = {
  Pending: 'pending',
  Completed: 'completed',
  Verified: 'verified',
  Rejected: 'rejected',
  Suspended: 'suspended',
} as const;
