import { Controller, Get, Param, Post, Query } from '@nestjs/common';

import { CurrentUser } from '../../../identity/presentation/http/current-user.decorator';
import { MarkNotificationReadUseCase } from '../../application/commands/mark-notification-read.use-case';
import { ListNotificationsQuery } from '../../application/queries/list-notifications.query';

@Controller('notifications')
export class NotificationsController {
  public constructor(
    private readonly listNotifications: ListNotificationsQuery,
    private readonly markRead: MarkNotificationReadUseCase,
  ) {}

  @Get()
  public async list(
    @CurrentUser() userId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit = '20',
  ) {
    const pageSize = Math.min(Number(limit) || 20, 50);
    const page = await this.listNotifications.execute({
      userId,
      limit: pageSize,
      ...(cursor ? { cursor } : {}),
    });
    return { data: page.data, meta: page.meta };
  }

  @Post(':id/read')
  public async read(@CurrentUser() userId: string, @Param('id') id: string) {
    await this.markRead.execute({ notificationId: id, userId });
    return { data: { ok: true } };
  }
}
