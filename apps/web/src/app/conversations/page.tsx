import Link from 'next/link';
import { Card } from '@dreamingcloud/ui';

import { apiFetchServer } from '../../lib/api-server';

interface ConversationsResponse {
  data: readonly {
    id: string;
    kind: string;
    lastMessagePreview?: string;
  }[];
}

export default async function ConversationsPage() {
  let items: ConversationsResponse['data'] = [];
  try {
    const response = await apiFetchServer<ConversationsResponse>('/conversations');
    items = response.data;
  } catch {
    items = [];
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-semibold">Messages</h1>
      <p className="mt-2 text-sm text-[var(--dc-color-muted)]">
        Conversations privées liées à vos contributions.
      </p>
      <div className="mt-8 grid gap-3">
        {items.length === 0 ? (
          <Card>Aucune conversation pour le moment.</Card>
        ) : (
          items.map((item) => (
            <Link key={item.id} href={`/conversations/${item.id}`}>
              <Card>
                <p className="font-medium">Conversation {item.id.slice(0, 8)}</p>
                <p className="text-sm text-[var(--dc-color-muted)]">
                  {item.lastMessagePreview ?? 'Ouvrir la discussion'}
                </p>
              </Card>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}
