import { Inject, Injectable } from '@nestjs/common';
import { UniqueId } from '@dreamingcloud/shared-kernel';
import { eq } from 'drizzle-orm';

import { DATABASE, type Database } from '../../../../platform/database/database.types';
import {
  authCredentials,
  userProfiles,
  userSettings,
  users,
} from '../../../../platform/database/schema';
import { User } from '../../domain/entities/user.entity';
import type { UserRepository } from '../../domain/ports/user.repository';
import type { UserStatus } from '../../domain/value-objects/user-status';

@Injectable()
export class DrizzleUserRepository implements UserRepository {
  public constructor(@Inject(DATABASE) private readonly database: Database) {}

  public async findById(id: UniqueId): Promise<User | null> {
    const [row] = await this.database
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        status: users.status,
        emailVerifiedAt: users.emailVerifiedAt,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        displayName: userProfiles.displayName,
        bio: userProfiles.bio,
      })
      .from(users)
      .innerJoin(userProfiles, eq(userProfiles.userId, users.id))
      .where(eq(users.id, id.value))
      .limit(1);

    return row ? this.map(row) : null;
  }

  public async findByEmail(email: string): Promise<User | null> {
    const [row] = await this.database
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        status: users.status,
        emailVerifiedAt: users.emailVerifiedAt,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        displayName: userProfiles.displayName,
        bio: userProfiles.bio,
      })
      .from(users)
      .innerJoin(userProfiles, eq(userProfiles.userId, users.id))
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    return row ? this.map(row) : null;
  }

  public async findByUsername(username: string): Promise<User | null> {
    const [row] = await this.database
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        status: users.status,
        emailVerifiedAt: users.emailVerifiedAt,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        displayName: userProfiles.displayName,
        bio: userProfiles.bio,
      })
      .from(users)
      .innerJoin(userProfiles, eq(userProfiles.userId, users.id))
      .where(eq(users.username, username.toLowerCase()))
      .limit(1);

    return row ? this.map(row) : null;
  }

  public async save(user: User, passwordHash?: string): Promise<void> {
    const snapshot = user.toSnapshot();

    await this.database
      .insert(users)
      .values({
        id: snapshot.id.value,
        email: snapshot.email,
        username: snapshot.username,
        status: snapshot.status,
        emailVerifiedAt: snapshot.emailVerifiedAt,
        createdAt: snapshot.createdAt,
        updatedAt: snapshot.updatedAt,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          status: snapshot.status,
          emailVerifiedAt: snapshot.emailVerifiedAt,
          updatedAt: snapshot.updatedAt,
          deletedAt: snapshot.status === 'deleted' ? snapshot.updatedAt : null,
        },
      });

    await this.database
      .insert(userProfiles)
      .values({
        userId: snapshot.id.value,
        displayName: snapshot.displayName,
        bio: snapshot.bio,
        locale: 'fr',
        updatedAt: snapshot.updatedAt,
      })
      .onConflictDoUpdate({
        target: userProfiles.userId,
        set: {
          displayName: snapshot.displayName,
          bio: snapshot.bio,
          updatedAt: snapshot.updatedAt,
        },
      });

    await this.database
      .insert(userSettings)
      .values({
        userId: snapshot.id.value,
        profileVisibility: 'public',
        notificationPreferences: {
          email: true,
          inApp: true,
        },
        updatedAt: snapshot.updatedAt,
      })
      .onConflictDoNothing();

    if (passwordHash) {
      await this.savePasswordHash(snapshot.id, passwordHash);
    }
  }

  public async savePasswordHash(userId: UniqueId, passwordHash: string): Promise<void> {
    await this.database
      .insert(authCredentials)
      .values({
        id: UniqueId.create().value,
        userId: userId.value,
        passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoNothing();

    await this.database
      .update(authCredentials)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(authCredentials.userId, userId.value));
  }

  public async getPasswordHash(userId: UniqueId): Promise<string | null> {
    const [row] = await this.database
      .select({ passwordHash: authCredentials.passwordHash })
      .from(authCredentials)
      .where(eq(authCredentials.userId, userId.value))
      .limit(1);

    return row?.passwordHash ?? null;
  }

  public async deletePersonalData(userId: UniqueId): Promise<Record<string, unknown>> {
    const user = await this.findById(userId);
    if (!user) {
      return {};
    }

    const exportPayload = {
      id: user.id.value,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      createdAt: user.createdAt.toISOString(),
    };

    user.markDeleted();
    await this.save(user);
    await this.database
      .update(userProfiles)
      .set({
        displayName: 'Compte supprimé',
        bio: null,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, userId.value));

    return exportPayload;
  }

  private map(row: {
    id: string;
    email: string;
    username: string;
    status: string;
    emailVerifiedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    displayName: string;
    bio: string | null;
  }): User {
    return User.rehydrate({
      id: UniqueId.create(row.id),
      email: row.email,
      username: row.username,
      status: row.status as UserStatus,
      emailVerifiedAt: row.emailVerifiedAt,
      displayName: row.displayName,
      bio: row.bio,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
