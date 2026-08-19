const LOCAL_API_URL = 'http://localhost:3001/api/v1';

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/u, '');
}

export function resolveApiBaseUrl(): string {
  if (typeof window === 'undefined') {
    const serverUrl =
      process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? LOCAL_API_URL;
    if (serverUrl.startsWith('/')) {
      throw new Error(
        'API_INTERNAL_URL must be an absolute URL on the server (SSR cannot fetch a relative /api/v1 path).',
      );
    }

    return stripTrailingSlash(serverUrl);
  }

  return stripTrailingSlash(process.env.NEXT_PUBLIC_API_URL ?? LOCAL_API_URL);
}

function readBrowserCsrfToken(): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const match = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('csrf_token='));

  if (!match) {
    return null;
  }

  return decodeURIComponent(match.slice('csrf_token='.length));
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  extraHeaders?: HeadersInit,
): Promise<T> {
  const headers = new Headers(init.headers);
  if (extraHeaders) {
    const extras = new Headers(extraHeaders);
    extras.forEach((value, key) => {
      headers.set(key, value);
    });
  }

  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }

  const method = (init.method ?? 'GET').toUpperCase();
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const csrf = readBrowserCsrfToken();
    if (csrf) {
      headers.set('x-csrf-token', csrf);
    }
  }

  const response = await fetch(`${resolveApiBaseUrl()}${path}`, {
    ...init,
    credentials: 'include',
    headers,
    cache: 'no-store',
  });

  if (!response.ok) {
    const problem = (await response.json().catch(() => null)) as { detail?: string } | null;
    throw new Error(problem?.detail ?? `Erreur API ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
