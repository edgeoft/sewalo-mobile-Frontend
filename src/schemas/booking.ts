import { z } from 'zod';

import { isPastDate } from '@/features/services/utils/providerAvailability';

/** Booking confirmation details emitted by BookingConfirmationModal. */
export interface BookingDetails {
  serviceDate: string;
  startTime: string;
  location: string;
  city: string;
  lat: number;
  lng: number;
  notes: string;
}

export const getBookingDetailsSchema = (t: (key: string) => string) =>
  z.object({
    serviceDate: z
      .string()
      .min(1, t('services.serviceDateRequired'))
      .refine((date) => !isPastDate(date), t('services.pastDateNotAllowed')),
    startTime: z.string().min(1, t('services.startTimeRequired')),
    location: z.string(),
    locationCity: z.string(),
    locationLat: z.number(),
    locationLng: z.number(),
    notes: z.string(),
  });

export type BookingDetailsFormData = z.infer<ReturnType<typeof getBookingDetailsSchema>>;
