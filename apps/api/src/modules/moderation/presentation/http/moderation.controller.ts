import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { z } from 'zod';

import { RequirePolicies } from '../../../../platform/security/authorization';
import { CurrentUser } from '../../../identity/presentation/http/current-user.decorator';
import { ReportContentUseCase } from '../../application/commands/report-content.use-case';
import { ListOpenReportsQuery } from '../../application/queries/list-open-reports.query';

@Controller()
export class ModerationController {
  public constructor(
    private readonly reportContent: ReportContentUseCase,
    private readonly listOpenReports: ListOpenReportsQuery,
  ) {}

  @Post('reports')
  public async createReport(@CurrentUser() userId: string, @Body() body: unknown) {
    const input = z
      .object({
        subjectType: z.string().min(1).max(64),
        subjectId: z.uuidv7(),
        reason: z.string().min(3).max(200),
        details: z.string().max(2000).nullable().optional(),
      })
      .parse(body);

    const result = await this.reportContent.execute({
      reporterId: userId,
      subjectType: input.subjectType,
      subjectId: input.subjectId,
      reason: input.reason,
      details: input.details ?? null,
    });

    return { data: result };
  }

  @RequirePolicies('role:admin')
  @Get('moderation/reports')
  public async listReports(@Query('cursor') cursor?: string, @Query('limit') limit = '20') {
    const pageSize = Math.min(Number(limit) || 20, 50);
    const page = await this.listOpenReports.execute({
      limit: pageSize,
      ...(cursor ? { cursor } : {}),
    });
    return { data: page.data, meta: page.meta };
  }
}
