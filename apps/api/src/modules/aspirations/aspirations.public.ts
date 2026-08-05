export interface AspirationSummary {
  readonly id: string;
  readonly ownerId: string;
  readonly title: string;
  readonly status: 'draft' | 'published' | 'completed' | 'archived';
  readonly visibility: 'public' | 'unlisted' | 'private';
}

export interface AspirationsPublicApi {
  getSummary(aspirationId: string): Promise<AspirationSummary | null>;
}

export const ASPIRATIONS_PUBLIC_API = Symbol('ASPIRATIONS_PUBLIC_API');
