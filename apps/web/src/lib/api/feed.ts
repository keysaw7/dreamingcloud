import { apiFetch } from '../api';
import type { ApiListResponse, AspirationListItem } from '../types';

export interface FeedPage {
  items: AspirationListItem[];
  cursor: string | null;
  hasMore: boolean;
}

async function fetchFeed(path: string, limit: number, cursor?: string | null): Promise<FeedPage> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) {
    params.set('cursor', cursor);
  }

  const response = await apiFetch<ApiListResponse<AspirationListItem>>(
    `${path}?${params.toString()}`,
  );

  return {
    items: [...response.data],
    cursor: response.meta?.cursor ?? null,
    hasMore: Boolean(response.meta?.hasMore),
  };
}

export function fetchDiscoverPage(limit = 10, cursor?: string | null): Promise<FeedPage> {
  return fetchFeed('/feed/discover', limit, cursor);
}

export function fetchFollowingPage(limit = 10, cursor?: string | null): Promise<FeedPage> {
  return fetchFeed('/feed/following', limit, cursor);
}
