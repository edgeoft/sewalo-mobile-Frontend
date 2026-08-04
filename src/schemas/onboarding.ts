import { z } from 'zod';

export const validateAge18Plus = (dateString: string): boolean => {
  const birthDate = new Date(dateString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 18;
};

export const getPersonalInfoSchema = (t: (key: string) => string) =>
  z.object({
    fullName: z.string().optional(),
    email: z
      .string()
      .email({ message: t('validation.invalidEmail') })
      .optional()
      .or(z.literal('')),
    location: z.string().min(1, { message: t('validation.locationRequired') }),
    lat: z.number().optional(),
    lng: z.number().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    dateOfBirth: z
      .string()
      .min(1, { message: t('validation.dobRequired') })
      .refine(validateAge18Plus, {
        message: t('validation.mustBe18Plus'),
      }),
    avatar: z.string().min(1, { message: t('validation.avatarRequired') }),
    mobileNumber: z.string().optional(),
  });

export const personalInfoSchema = getPersonalInfoSchema((key) => {
  const defaults: Record<string, string> = {
    'validation.invalidEmail': 'Please enter a valid email address',
    'validation.locationRequired': 'Location is required',
    'validation.dobRequired': 'Date of birth is required',
    'validation.mustBe18Plus': 'You must be 18 years or older',
    'validation.avatarRequired': 'Profile photo is required',
  };
  return defaults[key] || key;
});

export { financeAccountSchema as financialSchema } from '@/schemas/provider';
