import { Module } from '@nestjs/common';

import { MarkNotificationReadUseCase } from './application/commands/mark-notification-read.use-case';
import { NotificationsEventHandler } from './application/notifications-event-handler.service';
import { ListNotificationsQuery } from './application/queries/list-notifications.query';
import { NotificationsController } from './presentation/http/notifications.controller';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsEventHandler, ListNotificationsQuery, MarkNotificationReadUseCase],
  exports: [NotificationsEventHandler],
})
export class NotificationsModule {}
