import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const registerSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_]+$/, "Username can only contain lowercase letters, numbers, and underscores"),
  email: z.string().email(),
  display_name: z.string().min(2).max(100),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one digit"),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
});

export const changePasswordSchema = z.object({
  current_password: z.string().min(1),
  new_password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one digit"),
});
