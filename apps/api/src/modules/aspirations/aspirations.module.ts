import { Module } from '@nestjs/common';
import { UniqueId } from '@dreamingcloud/shared-kernel';

import { AddMilestoneUseCase } from './application/commands/add-milestone.use-case';
import { AddNeedUseCase } from './application/commands/add-need.use-case';
import { CreateDraftUseCase } from './application/commands/create-draft.use-case';
import { PublishAspirationUseCase } from './application/commands/publish-aspiration.use-case';
import { GetAspirationQuery } from './application/queries/get-aspiration.query';
import { GetAspirationSummaryQuery } from './application/queries/get-aspiration-summary.query';
import { ASPIRATION_REPOSITORY } from './domain/ports/aspiration.repository';
import { DrizzleAspirationRepository } from './infrastructure/persistence/drizzle-aspiration.repository';
import { AspirationsController } from './presentation/http/aspirations.controller';
import { ASPIRATIONS_PUBLIC_API } from './aspirations.public';

@Module({
  controllers: [AspirationsController],
  providers: [
    CreateDraftUseCase,
    PublishAspirationUseCase,
    AddNeedUseCase,
    AddMilestoneUseCase,
    GetAspirationQuery,
    GetAspirationSummaryQuery,
    { provide: ASPIRATION_REPOSITORY, useClass: DrizzleAspirationRepository },
    {
      provide: ASPIRATIONS_PUBLIC_API,
      useFactory: (repository: DrizzleAspirationRepository) => ({
        getSummary: async (aspirationId: string) => {
          const aspiration = await repository.findById(UniqueId.create(aspirationId));
          if (!aspiration) {
            return null;
          }

          return {
            id: aspiration.id.value,
            ownerId: aspiration.ownerId.value,
            title: aspiration.title,
            status: aspiration.status,
            visibility: aspiration.visibility,
          };
        },
      }),
      inject: [ASPIRATION_REPOSITORY],
    },
  ],
  exports: [ASPIRATIONS_PUBLIC_API, ASPIRATION_REPOSITORY],
})
export class AspirationsModule {}
