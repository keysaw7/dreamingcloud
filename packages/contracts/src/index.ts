import { z } from 'zod';

export * from './identity.js';
export * from './aspirations.js';

export const domainEventEnvelopeSchema = z.object({
  eventId: z.uuidv7(),
  name: z.string().min(1),
  occurredAt: z.iso.datetime(),
  actorId: z.uuidv7().nullable(),
  aggregateType: z.string().min(1),
  aggregateId: z.uuidv7(),
  correlationId: z.uuidv7(),
  causationId: z.uuidv7().nullable(),
  payload: z.record(z.string(), z.unknown()),
});

export type DomainEventEnvelope = z.infer<typeof domainEventEnvelopeSchema>;

export const paginationQuerySchema = z.object({
  cursor: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const problemDetailsSchema = z.object({
  type: z.url(),
  title: z.string(),
  status: z.number().int(),
  detail: z.string().optional(),
  instance: z.string().optional(),
  code: z.string().optional(),
});
