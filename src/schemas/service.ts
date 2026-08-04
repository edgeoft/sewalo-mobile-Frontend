import { z } from 'zod';
import { DELIVERY_TYPES } from '@/types';

export const getServiceFormSchema = (t: (key: string) => string) =>
  z
    .object({
      title: z.string().min(3, t('validation.serviceTitleMin')),
      categoryId: z.string().min(1, t('validation.categoryRequired')),
      serviceTypeIds: z.array(z.string()).min(1, t('validation.serviceTypeRequired')),
      description: z.string().min(20, t('validation.descriptionMin')),
      rates: z.record(
        z.string(),
        z.object({
          price: z
            .string()
            .min(1, t('validation.priceRequired'))
            .refine(
              (val) => {
                const num = Number(val);
                return !isNaN(num) && num > 0;
              },
              { message: t('validation.positiveNumber') },
            ),
          billingBasis: z.enum(['per_hour', 'per_day', 'per_job', 'per_project', 'per_session']),
          duration: z
            .string()
            .min(1, t('validation.durationRequired'))
            .refine(
              (val) => {
                const num = Number(val);
                return !isNaN(num) && num > 0;
              },
              { message: t('validation.positiveNumber') },
            ),
          durationUnit: z.enum(['minutes', 'hours', 'days', 'weeks']),
        }),
      ),
      deliveryTypes: z
        .array(z.enum([DELIVERY_TYPES.Fixed, DELIVERY_TYPES.Remote, DELIVERY_TYPES.Customer]))
        .min(1, t('validation.deliveryTypeRequired')),
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
            title: z.string().min(3, t('validation.packageTitleMin')),
            description: z.string().min(10, t('validation.packageDescMin')),
            price: z
              .string()
              .min(1, t('validation.priceRequired'))
              .refine(
                (val) => {
                  const num = Number(val);
                  return !isNaN(num) && num > 0;
                },
                { message: t('validation.positiveNumber') },
              ),
          }),
        )
        .optional(),
    })
    .superRefine((data, ctx) => {
      for (const id of data.serviceTypeIds) {
        const rate = data.rates[id];
        if (!rate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['rates', id, 'price'],
            message: t('validation.pricingDetailsRequired'),
          });
        } else {
          if (!rate.price || Number(rate.price) <= 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['rates', id, 'price'],
              message: t('validation.positiveNumber'),
            });
          }
          if (!rate.duration || Number(rate.duration) <= 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['rates', id, 'duration'],
              message: t('validation.positiveNumber'),
            });
          }
        }
      }

      if (data.portfolioUrl && data.portfolioUrl.trim().length > 0) {
        const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
        if (!urlPattern.test(data.portfolioUrl)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['portfolioUrl'],
            message: t('validation.invalidUrl'),
          });
        }
      }
    });

export const serviceFormSchema = getServiceFormSchema((key) => {
  const defaults: Record<string, string> = {
    'validation.serviceTitleMin': 'Service title must be at least 3 characters',
    'validation.categoryRequired': 'Category is required',
    'validation.serviceTypeRequired': 'Select at least 1 service type',
    'validation.descriptionMin': 'Description must be at least 20 characters',
    'validation.priceRequired': 'Price is required',
    'validation.positiveNumber': 'Price/Duration must be a positive number',
    'validation.durationRequired': 'Duration is required',
    'validation.deliveryTypeRequired': 'Select at least 1 delivery method',
    'validation.packageTitleMin': 'Package title must be at least 3 characters',
    'validation.packageDescMin': 'Description must be at least 10 characters',
    'validation.pricingDetailsRequired': 'Pricing details are required',
    'validation.invalidUrl': 'Please enter a valid website URL',
  };
  return defaults[key] || key;
});
