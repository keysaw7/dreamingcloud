import { apiFetch } from '../api';
import type { ApiItemResponse, CurrentUser } from '../types';

export async function login(email: string, password: string): Promise<void> {
  await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(input: {
  email: string;
  username: string;
  displayName: string;
  password: string;
  emailCode: string;
}): Promise<void> {
  await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function requestEmailCode(email: string): Promise<void> {
  await apiFetch('/auth/request-email-code', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function verifyEmail(token: string): Promise<void> {
  await apiFetch('/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

export async function requestPasswordReset(email: string): Promise<void> {
  await apiFetch('/auth/request-password-reset', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token: string, password: string): Promise<void> {
  await apiFetch('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  });
}

export async function logout(): Promise<void> {
  await apiFetch('/auth/logout', {
    method: 'POST',
    body: '{}',
  });
}

export async function fetchMeClient(): Promise<CurrentUser | null> {
  try {
    const response = await apiFetch<ApiItemResponse<CurrentUser>>('/me');
    return response.data;
  } catch {
    return null;
  }
}
