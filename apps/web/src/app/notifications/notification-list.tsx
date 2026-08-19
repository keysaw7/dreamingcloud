'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Alert } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { EmptyState } from '../../components/ui/empty-state';
import { apiFetch } from '../../lib/api';
import { formatRelativeDate } from '../../lib/format';

interface NotificationItem {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
}

const LABEL_KEYS: Record<string, string> = {
  'social.support.given.v1': 'labels.supportGiven',
  'social.comment.created.v1': 'labels.commentCreated',
  'social.save.created.v1': 'labels.saveCreated',
  'social.follow.created.v1': 'labels.followCreated',
  'contributions.contribution.proposed.v1': 'labels.contributionProposed',
  'contributions.contribution.accepted.v1': 'labels.contributionAccepted',
  'contributions.contribution.declined.v1': 'labels.contributionDeclined',
  'contributions.contribution.in_progress.v1': 'labels.contributionInProgress',
  'contributions.contribution.completed.v1': 'labels.contributionCompleted',
  'messaging.message.sent.v1': 'labels.messageSent',
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
  const t = useTranslations('notifications');
  const [items, setItems] = useState(initialItems);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function markRead(id: string) {
    setError(null);
    setPendingId(id);
    try {
      await apiFetch(`/notifications/${id}/read`, { method: 'POST', body: '{}' });
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, readAt: new Date().toISOString() } : item)),
      );
    } catch {
      setError(t('markReadError'));
    } finally {
      setPendingId(null);
    }
  }

  if (items.length === 0) {
    return <EmptyState title={t('empty')} description={t('emptyDescription')} />;
  }

  return (
    <div className="space-y-3">
      {error ? <Alert variant="destructive">{error}</Alert> : null}
      {items.map((item) => {
        const href = hrefFor(item);
        const labelKey = LABEL_KEYS[item.type];
        const label = labelKey && t.has(labelKey) ? t(labelKey) : item.type;
        const content = (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-sm">{label}</p>
              {!item.readAt ? <Badge>{t('newBadge')}</Badge> : null}
            </div>
            <p className="mt-1 text-muted-foreground text-sm">
              {formatRelativeDate(item.createdAt)}
            </p>
          </>
        );

        return (
          <Card
            key={item.id}
            className={
              !item.readAt
                ? 'border border-primary/30 bg-card p-4'
                : 'border border-border bg-card p-4'
            }
          >
            {href ? (
              <Link
                href={href}
                onClick={() => void markRead(item.id)}
                className="block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {content}
              </Link>
            ) : (
              content
            )}
            {!item.readAt ? (
              <div className="mt-3">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={pendingId === item.id}
                  onClick={() => void markRead(item.id)}
                >
                  {t('markRead')}
                </Button>
              </div>
            ) : null}
          </Card>
        );
      })}
    </div>
  );
}
