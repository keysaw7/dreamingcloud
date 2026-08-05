import { Module } from '@nestjs/common';

import { RankingEngine } from './application/ranking-engine.service';
import { RankingEventHandler } from './application/ranking-event-handler.service';
import { RANKING_PUBLIC_API } from './ranking.public';

@Module({
  providers: [
    RankingEngine,
    RankingEventHandler,
    {
      provide: RANKING_PUBLIC_API,
      useFactory: (engine: RankingEngine) => ({
        getScore: (aggregateType: string, aggregateId: string) =>
          engine.getScore(aggregateType, aggregateId),
      }),
      inject: [RankingEngine],
    },
  ],
  exports: [RANKING_PUBLIC_API, RankingEventHandler, RankingEngine],
})
export class RankingModule {}
