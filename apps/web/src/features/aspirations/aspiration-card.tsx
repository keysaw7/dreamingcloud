'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Avatar, Badge, Card, Progress } from '@dreamingcloud/ui';

import { formatRelativeDate, needTypeLabel } from '../../lib/format';
import type { AspirationListItem } from '../../lib/types';

export function AspirationCard({
  item,
  progressLabel,
}: {
  item: AspirationListItem;
  progressLabel?: string;
}) {
  const t = useTranslations('aspirations');
  const common = useTranslations('common');
  const resolvedProgress = progressLabel ?? t('progress');
  const href = `/aspirations/${item.slug || item.id}`;
  const ownerName =
    item.ownerDisplayName || item.ownerUsername
      ? item.ownerDisplayName || `@${item.ownerUsername}`
      : t('anonymousOwner');
  const ownerHref = item.ownerUsername
    ? `/users/${item.ownerUsername}`
    : item.ownerId
      ? `/users/${item.ownerId}`
      : null;

  return (
    <Card variant="interactive" className="overflow-hidden p-0">
      <div className="flex items-start gap-3 border-b border-[var(--dc-color-border)] px-5 py-4">
        {ownerHref ? (
          <Link href={ownerHref} className="shrink-0" aria-label={ownerName}>
            <Avatar name={ownerName} size="md" />
          </Link>
        ) : (
          <Avatar name={ownerName} size="md" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {ownerHref ? (
              <Link href={ownerHref} className="truncate text-sm font-semibold hover:underline">
                {ownerName}
              </Link>
            ) : (
              <p className="truncate text-sm font-semibold">{ownerName}</p>
            )}
            {item.ownerUsername ? (
              <span className="truncate text-sm text-[var(--dc-color-muted)]">
                @{item.ownerUsername}
              </span>
            ) : null}
            {item.publishedAt ? (
              <span className="text-sm text-[var(--dc-color-muted)]">
                · {formatRelativeDate(item.publishedAt)}
              </span>
            ) : null}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {typeof item.progressPercent === 'number' ? (
              <Badge variant="primary">
                {resolvedProgress} {item.progressPercent}%
              </Badge>
            ) : null}
          </div>
        </div>
      </div>

      <Link href={href} className="block px-5 py-4">
        <h2 className="text-xl font-semibold tracking-tight text-[var(--dc-color-ink)]">
          {item.title}
        </h2>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--dc-color-muted)]">
          {item.story}
        </p>
        {typeof item.progressPercent === 'number' ? (
          <Progress className="mt-5" value={item.progressPercent} label={resolvedProgress} />
        ) : null}
      </Link>

      <div className="flex items-center justify-between gap-3 border-t border-[var(--dc-color-border)] bg-[var(--dc-color-surface-muted)] px-5 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--dc-color-muted)]">
          {common('openContribution')}
        </p>
        <Link
          href={href}
          className="text-sm font-semibold text-[var(--dc-color-primary)] hover:underline"
        >
          {common('viewDream')}
        </Link>
      </div>
    </Card>
  );
}

export function NeedBadge({ needType }: { needType: string }) {
  return <Badge>{needTypeLabel(needType)}</Badge>;
}
