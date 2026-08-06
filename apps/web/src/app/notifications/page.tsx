import { getTranslations } from 'next-intl/server';
import { PageShell } from '@dreamingcloud/ui';

import { AuthGate } from '../../features/auth/auth-gate';
import { apiFetchServer } from '../../lib/api-server';
import { getCurrentUser } from '../../lib/session';
import type { ApiListResponse } from '../../lib/types';
import { NotificationList } from './notification-list';

interface NotificationRow {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
}

export default async function NotificationsPage() {
  const t = await getTranslations('notifications');
  const nav = await getTranslations('nav');
  const user = await getCurrentUser();

  if (!user) {
    return (
      <PageShell title={t('title')} maxWidth="lg">
        <AuthGate title={t('loginPrompt')} loginLabel={nav('login')} />
      </PageShell>
    );
  }

  let items: NotificationRow[] = [];
  try {
    const response = await apiFetchServer<ApiListResponse<NotificationRow>>('/notifications');
    items = [...response.data];
  } catch {
    items = [];
  }

  return (
    <PageShell title={t('title')} maxWidth="lg">
      <NotificationList initialItems={items} />
    </PageShell>
  );
}
