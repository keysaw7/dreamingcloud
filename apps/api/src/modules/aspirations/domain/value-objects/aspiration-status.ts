export const aspirationStatuses = ['draft', 'published', 'completed', 'archived'] as const;

export type AspirationStatus = (typeof aspirationStatuses)[number];
