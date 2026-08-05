import { Controller, Delete, Param, Post } from '@nestjs/common';

import { CurrentUser } from '../../../identity/presentation/http/current-user.decorator';
import { FollowUserUseCase } from '../../application/commands/follow-user.use-case';
import { UnfollowUserUseCase } from '../../application/commands/unfollow-user.use-case';

@Controller('users/:id')
export class FollowsController {
  public constructor(
    private readonly followUser: FollowUserUseCase,
    private readonly unfollowUser: UnfollowUserUseCase,
  ) {}

  @Post('follow')
  public async follow(@CurrentUser() followerId: string, @Param('id') followingId: string) {
    return {
      data: await this.followUser.execute({ followerId, followingId }),
    };
  }

  @Delete('follow')
  public async unfollow(@CurrentUser() followerId: string, @Param('id') followingId: string) {
    return {
      data: await this.unfollowUser.execute({ followerId, followingId }),
    };
  }
}
