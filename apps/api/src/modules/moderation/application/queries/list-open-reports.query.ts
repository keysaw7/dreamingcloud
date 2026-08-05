import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, lt, or } from 'drizzle-orm';

import { DATABASE, type Database } from '../../../../platform/database/database.types';
import { reports } from '../../../../platform/database/schema';
import {
  createCursorPage,
  type CursorPage,
  decodeCursor,
} from '../../../../platform/http/cursor-pagination';

export interface ReportItem {
  readonly id: string;
  readonly reporterId: string;
  readonly subjectType: string;
  readonly subjectId: string;
  readonly reason: string;
  readonly details: string | null;
  readonly status: string;
  readonly createdAt: string;
}

@Injectable()
export class ListOpenReportsQuery {
  public constructor(@Inject(DATABASE) private readonly database: Database) {}

  public async execute(input: { cursor?: string; limit: number }): Promise<CursorPage<ReportItem>> {
    const decoded = input.cursor ? decodeCursor(input.cursor) : null;
    const filters = [eq(reports.status, 'open')];

    if (decoded?.createdAt) {
      const cursorCreatedAt = new Date(decoded.createdAt);
      filters.push(
        or(
          lt(reports.createdAt, cursorCreatedAt),
          and(eq(reports.createdAt, cursorCreatedAt), lt(reports.id, decoded.id)),
        )!,
      );
    }

    const rows = await this.database
      .select()
      .from(reports)
      .where(and(...filters))
      .orderBy(desc(reports.createdAt), desc(reports.id))
      .limit(input.limit + 1);

    const items: ReportItem[] = rows.map((row) => ({
      id: row.id,
      reporterId: row.reporterId,
      subjectType: row.subjectType,
      subjectId: row.subjectId,
      reason: row.reason,
      details: row.details,
      status: row.status,
      createdAt: row.createdAt.toISOString(),
    }));

    return createCursorPage(items, input.limit, (item) => ({
      id: item.id,
      createdAt: item.createdAt,
    }));
  }
}
