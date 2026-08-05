import { Module } from '@nestjs/common';

import { ReportContentUseCase } from './application/commands/report-content.use-case';
import { ListOpenReportsQuery } from './application/queries/list-open-reports.query';
import { ModerationController } from './presentation/http/moderation.controller';

@Module({
  controllers: [ModerationController],
  providers: [ReportContentUseCase, ListOpenReportsQuery],
})
export class ModerationModule {}
