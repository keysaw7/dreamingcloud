import { cookies } from 'next/headers';

import { apiFetch } from './api';

export async function apiFetchServer<T>(path: string, init: RequestInit = {}): Promise<T> {
  const jar = await cookies();
  const cookieHeader = jar
    .getAll()
    .map((entry) => `${entry.name}=${entry.value}`)
    .join('; ');

  return apiFetch<T>(path, init, cookieHeader ? { cookie: cookieHeader } : undefined);
}
