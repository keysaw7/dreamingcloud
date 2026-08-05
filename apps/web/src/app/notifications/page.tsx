import Link from 'next/link';
import { Button, Card } from '@dreamingcloud/ui';

import { apiFetchServer } from '../../lib/api-server';
import { NotificationList } from './notification-list';

interface NotificationsResponse {
  data: Array<{
    id: string;
    type: string;
    payload: Record<string, unknown>;
    readAt: string | null;
    createdAt: string;
  }>;
}

export default async function NotificationsPage() {
  let items: NotificationsResponse['data'] = [];
  try {
    const response = await apiFetchServer<NotificationsResponse>('/notifications');
    items = response.data;
  } catch {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <Card>
          <p>Connectez-vous pour voir vos notifications.</p>
          <Link href="/auth/login" className="mt-4 inline-block">
            <Button>Connexion</Button>
          </Link>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold">Notifications</h1>
      <div className="mt-6">
        <NotificationList initialItems={items} />
      </div>
    </main>
  );
}
