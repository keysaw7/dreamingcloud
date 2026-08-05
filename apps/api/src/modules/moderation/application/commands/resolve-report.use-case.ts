import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UniqueId } from '@dreamingcloud/shared-kernel';
import { and, eq } from 'drizzle-orm';

import { DATABASE, type Database } from '../../../../platform/database/database.types';
import { moderationActions, reports } from '../../../../platform/database/schema';

@Injectable()
export class ResolveReportUseCase {
  public constructor(@Inject(DATABASE) private readonly database: Database) {}

  public async execute(input: {
    reportId: string;
    moderatorId: string;
    action: 'dismiss' | 'remove';
    reason: string;
  }): Promise<{ reportId: string; status: string }> {
    const [report] = await this.database
      .select()
      .from(reports)
      .where(and(eq(reports.id, input.reportId), eq(reports.status, 'open')))
      .limit(1);

    if (!report) {
      throw new NotFoundException('Signalement introuvable ou déjà résolu.');
    }

    const now = new Date();
    const status = input.action === 'dismiss' ? 'dismissed' : 'actioned';

    await this.database
      .update(reports)
      .set({
        status,
        resolvedAt: now,
      })
      .where(eq(reports.id, input.reportId));

    await this.database.insert(moderationActions).values({
      id: UniqueId.create().value,
      reportId: input.reportId,
      moderatorId: input.moderatorId,
      subjectType: report.subjectType,
      subjectId: report.subjectId,
      action: input.action,
      reason: input.reason,
      createdAt: now,
    });

    return { reportId: input.reportId, status };
  }
}
