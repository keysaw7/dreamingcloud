import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { z } from 'zod';

import { Public } from '../../../../platform/security/authorization';
import { CurrentUser } from '../../../identity/presentation/http/current-user.decorator';
import { CreateCommentUseCase } from '../../application/commands/create-comment.use-case';
import { GiveSupportUseCase } from '../../application/commands/give-support.use-case';
import { SaveAspirationUseCase } from '../../application/commands/save-aspiration.use-case';
import { UnsaveAspirationUseCase } from '../../application/commands/unsave-aspiration.use-case';
import { WithdrawSupportUseCase } from '../../application/commands/withdraw-support.use-case';
import { ListCommentsQuery } from '../../application/queries/list-comments.query';

const createCommentSchema = z.object({
  body: z.string().min(1).max(2000),
  parentId: z
    .string()
    .regex(
      /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      'Identifiant parent invalide.',
    )
    .nullable()
    .optional(),
});

@Controller('aspirations/:id')
export class SocialController {
  public constructor(
    private readonly giveSupport: GiveSupportUseCase,
    private readonly withdrawSupport: WithdrawSupportUseCase,
    private readonly createComment: CreateCommentUseCase,
    private readonly saveAspiration: SaveAspirationUseCase,
    private readonly unsaveAspiration: UnsaveAspirationUseCase,
    private readonly listComments: ListCommentsQuery,
  ) {}

  @Public()
  @Get('comments')
  public async comments(
    @Param('id') aspirationId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit = '20',
  ) {
    const pageSize = Math.min(Number(limit) || 20, 50);
    const page = await this.listComments.execute({
      aspirationId,
      limit: pageSize,
      ...(cursor ? { cursor } : {}),
    });
    return { data: page.data, meta: page.meta };
  }

  @Post('support')
  public async support(@CurrentUser() userId: string, @Param('id') aspirationId: string) {
    return {
      data: await this.giveSupport.execute({ aspirationId, userId }),
    };
  }

  @Delete('support')
  public async unsupport(@CurrentUser() userId: string, @Param('id') aspirationId: string) {
    return {
      data: await this.withdrawSupport.execute({ aspirationId, userId }),
    };
  }

  @Post('comments')
  public async comment(
    @CurrentUser() userId: string,
    @Param('id') aspirationId: string,
    @Body() body: unknown,
  ) {
    const input = createCommentSchema.parse(body);
    return {
      data: await this.createComment.execute({
        aspirationId,
        authorId: userId,
        body: input.body,
        parentId: input.parentId ?? null,
      }),
    };
  }

  @Post('save')
  public async save(@CurrentUser() userId: string, @Param('id') aspirationId: string) {
    return {
      data: await this.saveAspiration.execute({ aspirationId, userId }),
    };
  }

  @Delete('save')
  public async unsave(@CurrentUser() userId: string, @Param('id') aspirationId: string) {
    return {
      data: await this.unsaveAspiration.execute({ aspirationId, userId }),
    };
  }
}
