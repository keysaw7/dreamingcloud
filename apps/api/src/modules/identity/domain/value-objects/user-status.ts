export const userStatuses = ['pending', 'active', 'suspended', 'deleted'] as const;

export type UserStatus = (typeof userStatuses)[number];
