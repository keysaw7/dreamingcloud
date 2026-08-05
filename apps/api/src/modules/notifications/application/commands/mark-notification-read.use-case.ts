import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';

import { DATABASE, type Database } from '../../../../platform/database/database.types';
import { notifications } from '../../../../platform/database/schema';

@Injectable()
export class MarkNotificationReadUseCase {
  public constructor(@Inject(DATABASE) private readonly database: Database) {}

  public async execute(input: { notificationId: string; userId: string }): Promise<void> {
    const [row] = await this.database
      .select({
        id: notifications.id,
        userId: notifications.userId,
        readAt: notifications.readAt,
      })
      .from(notifications)
      .where(eq(notifications.id, input.notificationId))
      .limit(1);

    if (!row) {
      throw new NotFoundException('Notification introuvable.');
    }

    if (row.userId !== input.userId) {
      throw new ForbiddenException();
    }

    if (row.readAt) {
      return;
    }

    await this.database
      .update(notifications)
      .set({ readAt: new Date() })
      .where(
        and(eq(notifications.id, input.notificationId), eq(notifications.userId, input.userId)),
      );
  }
}
