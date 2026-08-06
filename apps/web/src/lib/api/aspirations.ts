import { apiFetch } from '../api';
import type { ApiItemResponse, ApiListResponse, CommentItem, ContributionItem } from '../types';

export async function createAspiration(input: {
  title: string;
  story: string;
  visibility?: 'public' | 'unlisted' | 'private';
}): Promise<{ id: string; slug: string }> {
  const created = await apiFetch<ApiItemResponse<{ id: string; slug: string }>>('/aspirations', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return created.data;
}

export async function addNeed(
  aspirationId: string,
  input: { needType: string; title: string; description: string | null },
): Promise<void> {
  await apiFetch(`/aspirations/${aspirationId}/needs`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function addMilestone(
  aspirationId: string,
  input: { title: string; description: string | null },
): Promise<void> {
  await apiFetch(`/aspirations/${aspirationId}/milestones`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function publishAspiration(aspirationId: string): Promise<void> {
  await apiFetch(`/aspirations/${aspirationId}/publish`, {
    method: 'POST',
    body: '{}',
  });
}

export async function listComments(aspirationId: string): Promise<readonly CommentItem[]> {
  const response = await apiFetch<ApiListResponse<CommentItem>>(
    `/aspirations/${aspirationId}/comments?limit=50`,
  );
  return response.data;
}

export async function listContributions(
  aspirationId: string,
): Promise<readonly ContributionItem[]> {
  const response = await apiFetch<ApiListResponse<ContributionItem>>(
    `/aspirations/${aspirationId}/contributions`,
  );
  return response.data;
}
