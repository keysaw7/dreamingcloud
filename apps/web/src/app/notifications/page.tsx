import { getTranslations } from 'next-intl/server';
import { PageShell } from '@dreamingcloud/ui';

import { Alert } from '../../components/ui/alert';
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
  const common = await getTranslations('common');
  const user = await getCurrentUser();

  if (!user) {
    return (
      <PageShell title={t('title')} description={t('description')} maxWidth="lg">
        <AuthGate title={t('loginPrompt')} loginLabel={nav('login')} />
      </PageShell>
    );
  }

  let items: NotificationRow[] = [];
  let error: string | null = null;
  try {
    const response = await apiFetchServer<ApiListResponse<NotificationRow>>('/notifications');
    items = [...response.data];
  } catch (caughtError) {
    error = caughtError instanceof Error ? caughtError.message : common('errorGeneric');
  }

  return (
    <PageShell title={t('title')} description={t('description')} maxWidth="lg">
      {error ? (
        <Alert variant="destructive">{error}</Alert>
      ) : (
        <NotificationList initialItems={items} />
      )}
    </PageShell>
  );
}
