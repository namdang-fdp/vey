import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Use at least 8 characters."),
});

export type RegisterValues = z.infer<typeof registerSchema>;

export const verificationSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code."),
});

export type VerificationValues = z.infer<typeof verificationSchema>;

export const passwordRecoveryEmailSchema = z.object({
  email: z.email("Enter a valid email address."),
});

export type PasswordRecoveryEmailValues = z.infer<
  typeof passwordRecoveryEmailSchema
>;

export const passwordRecoveryPasswordSchema = z.object({
  password: z.string().min(8, "Use at least 8 characters."),
});

export type PasswordRecoveryPasswordValues = z.infer<
  typeof passwordRecoveryPasswordSchema
>;
