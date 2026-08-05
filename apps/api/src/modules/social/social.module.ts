import { Module } from '@nestjs/common';

import { CreateCommentUseCase } from './application/commands/create-comment.use-case';
import { FollowUserUseCase } from './application/commands/follow-user.use-case';
import { GiveSupportUseCase } from './application/commands/give-support.use-case';
import { SaveAspirationUseCase } from './application/commands/save-aspiration.use-case';
import { UnfollowUserUseCase } from './application/commands/unfollow-user.use-case';
import { UnsaveAspirationUseCase } from './application/commands/unsave-aspiration.use-case';
import { WithdrawSupportUseCase } from './application/commands/withdraw-support.use-case';
import { SOCIAL_REPOSITORY } from './domain/ports/social.repository';
import { DrizzleSocialRepository } from './infrastructure/persistence/drizzle-social.repository';
import { FollowsController } from './presentation/http/follows.controller';
import { SocialController } from './presentation/http/social.controller';

@Module({
  controllers: [SocialController, FollowsController],
  providers: [
    GiveSupportUseCase,
    WithdrawSupportUseCase,
    CreateCommentUseCase,
    SaveAspirationUseCase,
    UnsaveAspirationUseCase,
    FollowUserUseCase,
    UnfollowUserUseCase,
    { provide: SOCIAL_REPOSITORY, useClass: DrizzleSocialRepository },
  ],
})
export class SocialModule {}
