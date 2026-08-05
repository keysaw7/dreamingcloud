import { z } from 'zod';

export const registerUserSchema = z.object({
  email: z.email(),
  username: z.string().min(3).max(32),
  displayName: z.string().min(1).max(80),
  password: z.string().min(10).max(128),
});

export const loginUserSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});
