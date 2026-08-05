import { Module } from '@nestjs/common';

import { ProjectPublishedAspirationService } from './application/commands/project-published-aspiration.service';
import { ListDiscoverFeedQuery } from './application/queries/list-discover-feed.query';
import { ListFollowingFeedQuery } from './application/queries/list-following-feed.query';
import { FeedController } from './presentation/http/feed.controller';

@Module({
  controllers: [FeedController],
  providers: [ListDiscoverFeedQuery, ListFollowingFeedQuery, ProjectPublishedAspirationService],
  exports: [ProjectPublishedAspirationService],
})
export class FeedModule {}
