import { Controller, Get, Query } from '@nestjs/common';

import { Public } from '../../../../platform/security/authorization';
import { CurrentUser } from '../../../identity/presentation/http/current-user.decorator';
import { OptionalUser } from '../../../identity/presentation/http/optional-user.decorator';
import { ListDiscoverFeedQuery } from '../../application/queries/list-discover-feed.query';
import { ListFollowingFeedQuery } from '../../application/queries/list-following-feed.query';

@Controller('feed')
export class FeedController {
  public constructor(
    private readonly listDiscover: ListDiscoverFeedQuery,
    private readonly listFollowing: ListFollowingFeedQuery,
  ) {}

  @Public()
  @Get('discover')
  public async discover(
    @OptionalUser() _userId: string | null,
    @Query('cursor') cursor?: string,
    @Query('limit') limit = '20',
  ) {
    const pageSize = Math.min(Number(limit) || 20, 50);
    const page = await this.listDiscover.execute({
      limit: pageSize,
      ...(cursor ? { cursor } : {}),
    });
    return { data: page.data, meta: page.meta };
  }

  @Get('following')
  public async following(
    @CurrentUser() userId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit = '20',
  ) {
    const pageSize = Math.min(Number(limit) || 20, 50);
    const page = await this.listFollowing.execute({
      userId,
      limit: pageSize,
      ...(cursor ? { cursor } : {}),
    });
    return { data: page.data, meta: page.meta };
  }
}
