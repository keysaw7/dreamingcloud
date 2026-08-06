'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Alert, Button, EmptyState, Skeleton } from '@dreamingcloud/ui';

import { fetchDiscoverPage, fetchFollowingPage } from '../../lib/api/feed';
import type { AspirationListItem } from '../../lib/types';
import { AspirationCard } from './aspiration-card';

export function AspirationFeed({
  mode,
  initialItems,
  initialCursor,
  initialHasMore,
  emptyTitle,
  emptyDescription,
  emptyActionHref,
  emptyActionLabel,
}: {
  mode: 'discover' | 'following';
  initialItems: readonly AspirationListItem[];
  initialCursor?: string | null;
  initialHasMore?: boolean;
  emptyTitle: string;
  emptyDescription?: string;
  emptyActionHref?: string;
  emptyActionLabel?: string;
}) {
  const aspirations = useTranslations('aspirations');
  const common = useTranslations('common');
  const [items, setItems] = useState<AspirationListItem[]>([...initialItems]);
  const [cursor, setCursor] = useState<string | null>(initialCursor ?? null);
  const [hasMore, setHasMore] = useState(Boolean(initialHasMore));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadMore() {
    if (!hasMore || loading) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const page =
        mode === 'discover'
          ? await fetchDiscoverPage(10, cursor)
          : await fetchFollowingPage(10, cursor);
      setItems((prev) => {
        const known = new Set(prev.map((item) => item.id));
        return [...prev, ...page.items.filter((item) => !known.has(item.id))];
      });
      setCursor(page.cursor);
      setHasMore(page.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : common('errorGeneric'));
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={
          emptyActionHref && emptyActionLabel ? (
            <Link href={emptyActionHref}>
              <Button>{emptyActionLabel}</Button>
            </Link>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <AspirationCard key={item.id} item={item} progressLabel={aspirations('progress')} />
      ))}

      {error ? <Alert variant="danger">{error}</Alert> : null}

      {loading ? (
        <div className="space-y-4" aria-busy="true" aria-live="polite">
          <Skeleton className="h-48 w-full rounded-[var(--dc-radius-lg)]" />
          <Skeleton className="h-48 w-full rounded-[var(--dc-radius-lg)]" />
        </div>
      ) : null}

      {hasMore ? (
        <div className="flex justify-center pt-2">
          <Button variant="secondary" disabled={loading} onClick={() => void loadMore()}>
            {loading ? common('loading') : aspirations('loadMore')}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
