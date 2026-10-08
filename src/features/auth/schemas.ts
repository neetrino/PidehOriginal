import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(8, 'passwordMin')
  .regex(/[a-z]/, 'passwordLower')
  .regex(/[A-Z]/, 'passwordUpper')
  .regex(/[0-9]/, 'passwordDigit')
  .regex(/[^A-Za-z0-9]/, 'passwordSpecial');

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase()),
  password: z.string().min(1),
});

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(1).max(100),
    lastName: z.string().trim().min(1).max(100),
    email: z
      .string()
      .trim()
      .email()
      .transform((value) => value.toLowerCase()),
    phone: z.string().trim().min(5).max(40),
    password: passwordSchema,
    confirmPassword: z.string().min(1),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'passwordMismatch',
    path: ['confirmPassword'],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: 'passwordMismatch',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase()),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: passwordSchema,
    confirmPassword: z.string().min(1),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'passwordMismatch',
    path: ['confirmPassword'],
  });
