import { Module } from '@nestjs/common';

import { AspirationsModule } from '../aspirations/aspirations.module';
import { MessagingModule } from '../messaging/messaging.module';
import { ProposeContributionUseCase } from './application/commands/propose-contribution.use-case';
import { TransitionContributionUseCase } from './application/commands/transition-contribution.use-case';
import { CONTRIBUTION_REPOSITORY } from './domain/ports/contribution.repository';
import { DrizzleContributionRepository } from './infrastructure/persistence/drizzle-contribution.repository';
import { ContributionsController } from './presentation/http/contributions.controller';

@Module({
  imports: [AspirationsModule, MessagingModule],
  controllers: [ContributionsController],
  providers: [
    ProposeContributionUseCase,
    TransitionContributionUseCase,
    { provide: CONTRIBUTION_REPOSITORY, useClass: DrizzleContributionRepository },
  ],
})
export class ContributionsModule {}
