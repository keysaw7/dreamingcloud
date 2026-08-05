import { z } from 'zod';

export const createAspirationSchema = z.object({
  title: z.string().min(3).max(120),
  story: z.string().min(20).max(10_000),
  categoryId: z.uuidv7().nullable().optional(),
  visibility: z.enum(['public', 'unlisted', 'private']).optional(),
});

export const addNeedSchema = z.object({
  needType: z.enum(['skill', 'material', 'time', 'contact', 'other', 'money']),
  title: z.string().min(2).max(120),
  description: z.string().max(2000).nullable(),
});
