export interface RankingPublicApi {
  getScore(aggregateType: string, aggregateId: string): Promise<number>;
}

export const RANKING_PUBLIC_API = Symbol('RANKING_PUBLIC_API');
