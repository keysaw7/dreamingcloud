import Link from 'next/link';
import { Button, EmptyState } from '@dreamingcloud/ui';

import type { AspirationListItem } from '../../lib/types';
import { AspirationCard } from './aspiration-card';

export function AspirationList({
  items,
  emptyTitle,
  emptyDescription,
  emptyActionHref,
  emptyActionLabel,
  progressLabel,
}: {
  items: readonly AspirationListItem[];
  emptyTitle: string;
  emptyDescription?: string;
  emptyActionHref?: string;
  emptyActionLabel?: string;
  progressLabel?: string;
}) {
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
    <div className="grid gap-4">
      {items.map((item) =>
        progressLabel ? (
          <AspirationCard key={item.id} item={item} progressLabel={progressLabel} />
        ) : (
          <AspirationCard key={item.id} item={item} />
        ),
      )}
    </div>
  );
}
