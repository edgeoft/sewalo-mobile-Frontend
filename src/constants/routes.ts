export const ROUTES = {
  notifications: '/notifications',
  auth: {
    signin: '/auth/signin',
    signup: '/auth/signup',
    forgotPassword: '/auth/forgot-password',
    otpVerification: '/auth/otp-verification',
    resetPassword: '/auth/reset-password',
    roleSelection: '/auth/role-selection',
  },
  guest: {
    home: '/(guest)/home',
    findServices: '/(guest)/find-services',
    beProvider: '/(guest)/be-provider',
    getStarted: '/(guest)/get-started',
  },
  customer: {
    home: '/(customer)/home',
    bookings: '/(customer)/bookings',
    findServices: '/(customer)/find-services',
    favourites: '/(customer)/favourites',
    account: '/(customer)/account',
  },
  provider: {
    home: '/(provider)/home',
    services: '/(provider)/services',
    bookings: '/(provider)/bookings',
    earnings: '/(provider)/earnings',
    account: '/(provider)/account',
  },
  providerDetail: (id: string) => `/provider/${id}` as const,
} as const;
