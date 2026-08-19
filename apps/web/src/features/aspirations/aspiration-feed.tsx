'use client';

import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Alert } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';
import { EmptyState } from '../../components/ui/empty-state';
import { fetchDiscoverPage, fetchFollowingPage } from '../../lib/api/feed';
import type { AspirationListItem } from '../../lib/types';
import { AspirationCard } from './aspiration-card';

function FeedSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite" className="space-y-4">
      {[1, 2].map((item) => (
        <div key={item} className="animate-pulse rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-muted" />
            <div className="space-y-2">
              <div className="h-3 w-28 rounded bg-muted" />
              <div className="h-2.5 w-20 rounded bg-muted" />
            </div>
          </div>
          <div className="mt-6 h-5 w-3/4 rounded bg-muted" />
          <div className="mt-3 h-3 w-full rounded bg-muted" />
          <div className="mt-2 h-3 w-5/6 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

export function AspirationFeed({
  emptyActionHref,
  emptyActionLabel,
  emptyDescription,
  emptyTitle,
  initialCursor,
  initialHasMore,
  initialItems,
  mode,
}: Readonly<{
  mode: 'discover' | 'following';
  initialItems: readonly AspirationListItem[];
  initialCursor?: string | null;
  initialHasMore?: boolean;
  emptyTitle: string;
  emptyDescription?: string;
  emptyActionHref?: string;
  emptyActionLabel?: string;
}>) {
  const aspirations = useTranslations('aspirations');
  const common = useTranslations('common');
  const [items, setItems] = useState<AspirationListItem[]>([...initialItems]);
  const [cursor, setCursor] = useState(initialCursor ?? null);
  const [hasMore, setHasMore] = useState(Boolean(initialHasMore));
  const pagination = useMutation({
    mutationFn: () =>
      mode === 'discover' ? fetchDiscoverPage(10, cursor) : fetchFollowingPage(10, cursor),
    onSuccess: (page) => {
      setItems((current) => {
        const known = new Set(current.map((item) => item.id));
        return [...current, ...page.items.filter((item) => !known.has(item.id))];
      });
      setCursor(page.cursor);
      setHasMore(page.hasMore);
    },
  });

  if (items.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={
          emptyActionHref && emptyActionLabel ? (
            <Button asChild>
              <Link href={emptyActionHref}>{emptyActionLabel}</Link>
            </Button>
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
      {pagination.error ? (
        <Alert variant="destructive">
          {pagination.error instanceof Error ? pagination.error.message : common('errorGeneric')}
        </Alert>
      ) : null}
      {pagination.isPending ? <FeedSkeleton /> : null}
      {hasMore ? (
        <div className="flex justify-center pt-2">
          <Button
            disabled={pagination.isPending}
            variant="outline"
            onClick={() => pagination.mutate()}
          >
            {pagination.isPending ? common('loading') : aspirations('loadMore')}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
