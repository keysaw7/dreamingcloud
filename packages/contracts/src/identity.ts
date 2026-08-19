import { z } from 'zod';

export const PASSWORD_MIN_LENGTH = 10;
export const PASSWORD_MAX_LENGTH = 128;
export const EMAIL_OTP_LENGTH = 6;
export const EMAIL_OTP_COOLDOWN_SECONDS = 60;
export const EMAIL_OTP_TTL_MINUTES = 10;
export const EMAIL_OTP_VERIFIED_TTL_MINUTES = 30;
export const EMAIL_OTP_MAX_ATTEMPTS = 5;

export const passwordRuleChecks = {
  minLength: (value: string) => value.length >= PASSWORD_MIN_LENGTH,
  lowercase: (value: string) => /[a-z]/.test(value),
  uppercase: (value: string) => /[A-Z]/.test(value),
  digit: (value: string) => /\d/.test(value),
  special: (value: string) => /[^A-Za-z0-9]/.test(value),
} as const;

export type PasswordRuleId = keyof typeof passwordRuleChecks;

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH)
  .max(PASSWORD_MAX_LENGTH)
  .refine(passwordRuleChecks.lowercase)
  .refine(passwordRuleChecks.uppercase)
  .refine(passwordRuleChecks.digit)
  .refine(passwordRuleChecks.special);

export const emailCodeSchema = z.string().regex(new RegExp(`^\\d{${EMAIL_OTP_LENGTH}}$`));

export const registerUserSchema = z.object({
  email: z.email(),
  username: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-zA-Z0-9_]+$/),
  displayName: z.string().min(1).max(80),
  password: passwordSchema,
  emailCode: emailCodeSchema,
});

export const loginUserSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const requestEmailCodeSchema = z.object({
  email: z.email(),
});

export const verifyEmailCodeSchema = z.object({
  email: z.email(),
  emailCode: emailCodeSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
});
