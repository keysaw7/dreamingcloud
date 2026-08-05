import type { UniqueId } from '@dreamingcloud/shared-kernel';

import type { User } from '../entities/user.entity';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface UserRepository {
  findById(id: UniqueId): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  save(user: User, passwordHash?: string): Promise<void>;
  savePasswordHash(userId: UniqueId, passwordHash: string): Promise<void>;
  getPasswordHash(userId: UniqueId): Promise<string | null>;
  deletePersonalData(userId: UniqueId): Promise<Record<string, unknown>>;
}
