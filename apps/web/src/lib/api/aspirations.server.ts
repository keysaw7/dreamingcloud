import { apiFetchServer } from '../api-server';
import type {
  ApiItemResponse,
  ApiListResponse,
  AspirationDetail,
  AspirationListItem,
} from '../types';

export interface FeedPage {
  items: AspirationListItem[];
  cursor: string | null;
  hasMore: boolean;
}

export async function listDiscoverPage(limit = 10, cursor?: string | null): Promise<FeedPage> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) {
    params.set('cursor', cursor);
  }

  try {
    const feed = await apiFetchServer<ApiListResponse<AspirationListItem>>(
      `/feed/discover?${params.toString()}`,
    );
    return {
      items: [...feed.data],
      cursor: feed.meta?.cursor ?? null,
      hasMore: Boolean(feed.meta?.hasMore),
    };
  } catch {
    const list = await apiFetchServer<ApiListResponse<AspirationListItem>>(
      `/aspirations?limit=${limit}`,
    ).catch(() => ({ data: [] as AspirationListItem[], meta: undefined }));
    return {
      items: [...list.data],
      cursor: list.meta?.cursor ?? null,
      hasMore: Boolean(list.meta?.hasMore),
    };
  }
}

export async function listDiscover(limit = 20): Promise<readonly AspirationListItem[]> {
  const page = await listDiscoverPage(limit);
  return page.items;
}

export async function listFollowingPage(limit = 10, cursor?: string | null): Promise<FeedPage> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) {
    params.set('cursor', cursor);
  }

  const feed = await apiFetchServer<ApiListResponse<AspirationListItem>>(
    `/feed/following?${params.toString()}`,
  );
  return {
    items: [...feed.data],
    cursor: feed.meta?.cursor ?? null,
    hasMore: Boolean(feed.meta?.hasMore),
  };
}

export async function listFollowing(limit = 20): Promise<readonly AspirationListItem[]> {
  const page = await listFollowingPage(limit);
  return page.items;
}

export async function getAspiration(idOrSlug: string): Promise<AspirationDetail | null> {
  try {
    const response = await apiFetchServer<ApiItemResponse<AspirationDetail>>(
      `/aspirations/${idOrSlug}`,
    );
    return response.data;
  } catch {
    return null;
  }
}
