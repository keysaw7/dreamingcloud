import { Body, Controller, Get, Inject, Param, Post, Query } from '@nestjs/common';
import { UniqueId } from '@dreamingcloud/shared-kernel';
import { z } from 'zod';

import { createCursorPage, decodeCursor } from '../../../../platform/http/cursor-pagination';
import { Public } from '../../../../platform/security/authorization';
import { CurrentUser } from '../../../identity/presentation/http/current-user.decorator';
import { OptionalUser } from '../../../identity/presentation/http/optional-user.decorator';
import { AddMilestoneUseCase } from '../../application/commands/add-milestone.use-case';
import { AddNeedUseCase } from '../../application/commands/add-need.use-case';
import { CreateDraftUseCase } from '../../application/commands/create-draft.use-case';
import { PublishAspirationUseCase } from '../../application/commands/publish-aspiration.use-case';
import { GetAspirationQuery } from '../../application/queries/get-aspiration.query';
import {
  ASPIRATION_REPOSITORY,
  type AspirationRepository,
} from '../../domain/ports/aspiration.repository';

@Controller('aspirations')
export class AspirationsController {
  public constructor(
    private readonly createDraft: CreateDraftUseCase,
    private readonly publishAspiration: PublishAspirationUseCase,
    private readonly addNeed: AddNeedUseCase,
    private readonly addMilestone: AddMilestoneUseCase,
    private readonly getAspiration: GetAspirationQuery,
    @Inject(ASPIRATION_REPOSITORY) private readonly aspirations: AspirationRepository,
  ) {}

  @Post()
  public async create(@CurrentUser() userId: string, @Body() body: unknown) {
    const input = z
      .object({
        title: z.string().min(3).max(120),
        story: z.string().min(20).max(10_000),
        categoryId: z.uuidv7().nullable().optional(),
        visibility: z.enum(['public', 'unlisted', 'private']).optional(),
      })
      .parse(body);

    return {
      data: await this.createDraft.execute({
        ownerId: userId,
        title: input.title,
        story: input.story,
        categoryId: input.categoryId ?? null,
        visibility: input.visibility ?? 'public',
      }),
    };
  }

  @Public()
  @Get()
  public async list(@Query('cursor') cursor?: string, @Query('limit') limit = '20') {
    const pageSize = Math.min(Number(limit) || 20, 50);
    const decoded = cursor ? decodeCursor(cursor) : null;
    const items = await this.aspirations.listPublished({
      limit: pageSize + 1,
      ...(decoded?.createdAt ? { cursorPublishedAt: new Date(decoded.createdAt) } : {}),
      ...(decoded?.id ? { cursorId: decoded.id } : {}),
    });

    const page = createCursorPage(items, pageSize, (item) => ({
      id: item.id.value,
      createdAt: item.publishedAt?.toISOString() ?? item.createdAt.toISOString(),
    }));

    return {
      data: page.data.map((item) => ({
        id: item.id.value,
        title: item.title,
        slug: item.slug,
        story: item.story,
        progressPercent: item.progressPercent,
        publishedAt: item.publishedAt?.toISOString() ?? null,
      })),
      meta: page.meta,
    };
  }

  @Public()
  @Get(':idOrSlug')
  public async get(@Param('idOrSlug') idOrSlug: string, @OptionalUser() viewerId: string | null) {
    const data = UniqueId.isValid(idOrSlug)
      ? await this.getAspiration.byId(idOrSlug, viewerId)
      : await this.getAspiration.bySlug(idOrSlug, viewerId);
    return { data };
  }

  @Post(':id/publish')
  public async publish(@CurrentUser() userId: string, @Param('id') id: string) {
    await this.publishAspiration.execute({ aspirationId: id, actorId: userId });
    return { data: await this.getAspiration.byId(id, userId) };
  }

  @Post(':id/needs')
  public async createNeed(
    @CurrentUser() userId: string,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const input = z
      .object({
        needType: z.enum(['skill', 'material', 'time', 'contact', 'other', 'money']),
        title: z.string().min(2).max(120),
        description: z.string().max(2000).nullable(),
      })
      .parse(body);

    const result = await this.addNeed.execute({
      aspirationId: id,
      actorId: userId,
      ...input,
    });

    return { data: result };
  }

  @Post(':id/milestones')
  public async createMilestone(
    @CurrentUser() userId: string,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const input = z
      .object({
        title: z.string().min(2).max(120),
        description: z.string().max(2000).nullable(),
      })
      .parse(body);

    const result = await this.addMilestone.execute({
      aspirationId: id,
      actorId: userId,
      ...input,
    });

    return { data: result };
  }
}
