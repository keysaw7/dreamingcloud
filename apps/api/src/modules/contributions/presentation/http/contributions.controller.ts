import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UniqueId } from '@dreamingcloud/shared-kernel';
import { z } from 'zod';
import { Inject } from '@nestjs/common';

import { CurrentUser } from '../../../identity/presentation/http/current-user.decorator';
import { ProposeContributionUseCase } from '../../application/commands/propose-contribution.use-case';
import { TransitionContributionUseCase } from '../../application/commands/transition-contribution.use-case';
import {
  CONTRIBUTION_REPOSITORY,
  type ContributionRepository,
} from '../../domain/ports/contribution.repository';
import { contributionStatuses } from '../../domain/value-objects/contribution-status';

@Controller()
export class ContributionsController {
  public constructor(
    private readonly proposeContribution: ProposeContributionUseCase,
    private readonly transitionContribution: TransitionContributionUseCase,
    @Inject(CONTRIBUTION_REPOSITORY) private readonly contributions: ContributionRepository,
  ) {}

  @Post('aspirations/:aspirationId/contributions')
  public async propose(
    @CurrentUser() userId: string,
    @Param('aspirationId') aspirationId: string,
    @Body() body: unknown,
  ) {
    const input = z
      .object({
        needId: z.uuidv7().nullable().optional(),
        contributionType: z.enum([
          'material',
          'time',
          'skill',
          'advice',
          'contact',
          'mentorship',
          'partnership',
          'job',
          'hosting',
          'service',
          'other',
        ]),
        description: z.string().min(10).max(5000),
      })
      .parse(body);

    return {
      data: await this.proposeContribution.execute({
        aspirationId,
        contributorId: userId,
        needId: input.needId ?? null,
        contributionType: input.contributionType,
        description: input.description,
      }),
    };
  }

  @Get('aspirations/:aspirationId/contributions')
  public async list(@Param('aspirationId') aspirationId: string) {
    const items = await this.contributions.listByAspiration(UniqueId.create(aspirationId));
    return {
      data: items.map((item) => ({
        id: item.id.value,
        status: item.status,
        contributionType: item.contributionType,
        description: item.description,
        contributorId: item.contributorId.value,
        ownerId: item.ownerId.value,
        needId: item.needId?.value ?? null,
        conversationId: item.conversationId?.value ?? null,
        completedByContributorAt: item.completedByContributorAt?.toISOString() ?? null,
        completedByOwnerAt: item.completedByOwnerAt?.toISOString() ?? null,
      })),
    };
  }

  @Post('contributions/:id/transitions')
  public async transition(
    @CurrentUser() userId: string,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const input = z
      .object({
        to: z.enum(contributionStatuses),
      })
      .parse(body);

    return {
      data: await this.transitionContribution.execute({
        contributionId: id,
        actorId: userId,
        to: input.to,
      }),
    };
  }
}
