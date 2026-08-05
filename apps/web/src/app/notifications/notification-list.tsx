'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button, Card } from '@dreamingcloud/ui';

import { apiFetch } from '../../lib/api';

interface NotificationItem {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
}

const LABELS: Record<string, string> = {
  'social.support.given.v1': 'Quelqu’un soutient votre aspiration',
  'social.comment.created.v1': 'Nouveau commentaire sur votre aspiration',
  'social.save.created.v1': 'Quelqu’un a enregistré votre aspiration',
  'social.follow.created.v1': 'Nouvel abonné',
  'contributions.contribution.proposed.v1': 'Nouvelle proposition de contribution',
  'contributions.contribution.accepted.v1': 'Contribution acceptée',
  'contributions.contribution.declined.v1': 'Contribution refusée',
  'contributions.contribution.in_progress.v1': 'Contribution démarrée',
  'contributions.contribution.completed.v1': 'Contribution terminée',
  'messaging.message.sent.v1': 'Nouveau message',
};

function hrefFor(item: NotificationItem): string | null {
  const payload = item.payload;
  if (item.type.startsWith('contributions.') && typeof payload.aspirationId === 'string') {
    return `/aspirations/${payload.aspirationId}`;
  }
  if (item.type.startsWith('social.') && typeof payload.targetId === 'string') {
    if (payload.targetType === 'aspiration') {
      return `/aspirations/${payload.targetId}`;
    }
    return `/users/${payload.targetId}`;
  }
  if (item.type === 'messaging.message.sent.v1' && typeof payload.conversationId === 'string') {
    return `/conversations/${payload.conversationId}`;
  }
  if (typeof payload.aggregateId === 'string' && payload.aggregateType === 'aspiration') {
    return `/aspirations/${payload.aggregateId}`;
  }
  return null;
}

export function NotificationList({ initialItems }: { initialItems: NotificationItem[] }) {
  const [items, setItems] = useState(initialItems);

  async function markRead(id: string) {
    try {
      await apiFetch(`/notifications/${id}/read`, { method: 'POST', body: '{}' });
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, readAt: new Date().toISOString() } : item)),
      );
    } catch {
      // ignore
    }
  }

  if (items.length === 0) {
    return (
      <Card>
        <p className="text-sm text-[var(--dc-color-muted)]">Aucune notification.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const href = hrefFor(item);
        const label = LABELS[item.type] ?? item.type;
        const content = (
          <>
            <p className="text-sm font-medium">{label}</p>
            <p className="mt-1 text-sm text-[var(--dc-color-muted)]">
              {new Date(item.createdAt).toLocaleString('fr-FR')}
              {item.readAt ? ' · lu' : ' · non lu'}
            </p>
          </>
        );

        return (
          <Card key={item.id}>
            {href ? (
              <Link href={href} onClick={() => void markRead(item.id)} className="block">
                {content}
              </Link>
            ) : (
              content
            )}
            {!item.readAt ? (
              <div className="mt-3">
                <Button size="sm" variant="ghost" onClick={() => void markRead(item.id)}>
                  Marquer comme lu
                </Button>
              </div>
            ) : null}
          </Card>
        );
      })}
    </div>
  );
}
