export const NEED_TYPES = ['skill', 'material', 'time', 'contact', 'other'] as const;

export type NeedType = (typeof NEED_TYPES)[number];

export interface NeedDraft {
  title: string;
  needType: NeedType;
}

export interface MilestoneDraft {
  title: string;
  description: string;
}

export type CreationStep = 1 | 2 | 3;
