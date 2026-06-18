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

export const personalInfoSchema = z.object({
  fullName: z.string().optional(),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  location: z.string().min(1, { message: 'Location is required' }),
  lat: z.number().optional(),
  lng: z.number().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  dateOfBirth: z.string().min(1, { message: 'Date of birth is required' }).refine(validateAge18Plus, {
    message: 'You must be 18 years or older',
  }),
  languages: z.array(z.string()).min(1, { message: 'Please select at least one language' }),
  avatar: z.string().optional(),
  mobileNumber: z.string().optional(),
});

export interface PersonalInfoData {
  fullName?: string;
  email: string;
  mobileNumber?: string;
  location: string;
  lat?: number;
  lng?: number;
  city?: string;
  state?: string;
  country?: string;
  dateOfBirth: string;
  languages: string[];
  avatar?: string;
}

export const financialSchema = z.object({
  accountHolderName: z.string().min(1, { message: 'Account holder name is required' }),
  bankName: z.string().min(1, { message: 'Bank name is required' }),
  accountNumber: z.string().min(1, { message: 'Account number is required' }),
  branchName: z.string().optional(),
});

export interface FinancialData {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  branchName?: string;
}
