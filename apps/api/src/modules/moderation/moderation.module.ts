import { Module } from '@nestjs/common';

import { ReportContentUseCase } from './application/commands/report-content.use-case';
import { ResolveReportUseCase } from './application/commands/resolve-report.use-case';
import { ListOpenReportsQuery } from './application/queries/list-open-reports.query';
import { ModerationController } from './presentation/http/moderation.controller';

@Module({
  controllers: [ModerationController],
  providers: [ReportContentUseCase, ResolveReportUseCase, ListOpenReportsQuery],
})
export class ModerationModule {}
