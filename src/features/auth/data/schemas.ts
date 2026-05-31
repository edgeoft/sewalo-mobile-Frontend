import { z } from 'zod';

export const getSigninSchema = (t: (key: string) => string) =>
  z.object({
    phone: z
      .string()
      .min(9, t('auth.enterMobileNumber'))
      .regex(/^[0-9]+$/, t('auth.enterMobileNumber')),
    password: z.string().min(1, t('auth.enterYourPassword')),
  });

export type SigninFormData = z.infer<ReturnType<typeof getSigninSchema>>;

export const getSignupSchema = (t: (key: string) => string) =>
  z
    .object({
      name: z.string().min(1, t('auth.enterFullName')),
      phone: z
        .string()
        .min(9, t('auth.enterMobileNumber'))
        .regex(/^[0-9]+$/, t('auth.enterMobileNumber')),
      password: z.string().regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/, t('auth.passwordValidationFailed')),
      confirmPassword: z.string().min(1, t('auth.enterConfirmPassword')),
      agreeToTerms: z.boolean().refine((val) => val === true, {
        message: t('auth.agreeToTermsRequired'),
      }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('auth.enterConfirmPassword'),
      path: ['confirmPassword'],
    });

export type SignupFormData = z.infer<ReturnType<typeof getSignupSchema>>;

export const getForgotPasswordSchema = (t: (key: string) => string) =>
  z.object({
    phone: z
      .string()
      .min(9, t('auth.enterMobileNumber'))
      .regex(/^[0-9]+$/, t('auth.enterMobileNumber')),
  });

export type ForgotPasswordFormData = z.infer<ReturnType<typeof getForgotPasswordSchema>>;

export const getResetPasswordSchema = (t: (key: string) => string) =>
  z
    .object({
      password: z.string().regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/, t('auth.passwordValidationFailed')),
      confirmPassword: z.string().min(1, t('auth.enterConfirmPassword')),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('auth.enterConfirmPassword'),
      path: ['confirmPassword'],
    });

export type ResetPasswordFormData = z.infer<ReturnType<typeof getResetPasswordSchema>>;
