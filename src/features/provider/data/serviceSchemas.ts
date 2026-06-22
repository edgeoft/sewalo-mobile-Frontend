import { z } from 'zod';
import { DELIVERY_TYPES, DeliveryType } from '@/types';

export interface ServiceFormData {
  // Section 1
  title: string;
  categoryId: string;
  serviceTypeIds: string[];
  description: string;

  // Section 2 — keyed by serviceTypeId
  rates: Record<
    string,
    {
      price: string;
      billingBasis: 'per_hour' | 'per_day' | 'per_job' | 'per_project' | 'per_session';
      duration: string;
      durationUnit: 'minutes' | 'hours' | 'days' | 'weeks';
    }
  >;

  // Section 3
  deliveryTypes: DeliveryType[];

  // Section 4
  workSamples: { uri: string; uploaded: boolean }[];
  hashtags: string[]; // stored without #, displayed with #
  portfolioUrl: string;

  // Packages (Optional)
  packages?: {
    id?: string;
    title: string;
    description: string;
    price: string;
  }[];
}

export const serviceFormSchema = z
  .object({
    title: z.string().min(3, 'Service title must be at least 3 characters'),
    categoryId: z.string().min(1, 'Category is required'),
    serviceTypeIds: z.array(z.string()).min(1, 'Select at least 1 service type'),
    description: z.string().min(20, 'Description must be at least 20 characters'),
    rates: z.record(
      z.string(),
      z.object({
        price: z
          .string()
          .min(1, 'Price is required')
          .refine(
            (val) => {
              const num = Number(val);
              return !isNaN(num) && num > 0;
            },
            { message: 'Price must be a positive number' },
          ),
        billingBasis: z.enum(['per_hour', 'per_day', 'per_job', 'per_project', 'per_session']),
        duration: z
          .string()
          .min(1, 'Duration is required')
          .refine(
            (val) => {
              const num = Number(val);
              return !isNaN(num) && num > 0;
            },
            { message: 'Duration must be a positive number' },
          ),
        durationUnit: z.enum(['minutes', 'hours', 'days', 'weeks']),
      }),
    ),
    deliveryTypes: z
      .array(z.enum([DELIVERY_TYPES.Fixed, DELIVERY_TYPES.Remote, DELIVERY_TYPES.Customer]))
      .min(1, 'Select at least 1 delivery method'),
    workSamples: z.array(
      z.object({
        uri: z.string(),
        uploaded: z.boolean(),
      }),
    ),
    hashtags: z.array(z.string()),
    portfolioUrl: z.string().optional().or(z.literal('')),
    packages: z
      .array(
        z.object({
          id: z.string().optional(),
          title: z.string().min(3, 'Package title must be at least 3 characters'),
          description: z.string().min(10, 'Description must be at least 10 characters'),
          price: z
            .string()
            .min(1, 'Price is required')
            .refine(
              (val) => {
                const num = Number(val);
                return !isNaN(num) && num > 0;
              },
              { message: 'Price must be a positive number' },
            ),
        }),
      )
      .optional(),
  })
  .superRefine((data, ctx) => {
    // Validate that every selected service type ID has a rate card filled out
    for (const id of data.serviceTypeIds) {
      const rate = data.rates[id] as any;
      if (!rate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['rates', id, 'price'],
          message: 'Pricing details are required',
        });
      } else {
        if (!rate.price || Number(rate.price) <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['rates', id, 'price'],
            message: 'Price must be a positive number',
          });
        }
        if (!rate.duration || Number(rate.duration) <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['rates', id, 'duration'],
            message: 'Duration must be a positive number',
          });
        }
      }
    }

    // Validate portfolioUrl format if provided
    if (data.portfolioUrl && data.portfolioUrl.trim().length > 0) {
      const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
      if (!urlPattern.test(data.portfolioUrl)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['portfolioUrl'],
          message: 'Please enter a valid website URL',
        });
      }
    }
  });
