import { apiFetchServer } from './api-server';
import type { ApiItemResponse, CurrentUser } from './types';

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const response = await apiFetchServer<ApiItemResponse<CurrentUser>>('/me');
    return response.data;
  } catch {
    return null;
  }
}
