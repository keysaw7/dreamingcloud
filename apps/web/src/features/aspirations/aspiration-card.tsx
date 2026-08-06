'use client';

import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { Card } from '../../components/ui/card';
import { formatRelativeDate, needTypeLabel } from '../../lib/format';
import type { AspirationListItem } from '../../lib/types';

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function AspirationCard({
  item,
  progressLabel,
}: Readonly<{ item: AspirationListItem; progressLabel?: string }>) {
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
  const progress = Math.max(0, Math.min(item.progressPercent ?? 0, 100));

  return (
    <Card className="group overflow-hidden border border-border transition-colors hover:border-primary/35">
      <div className="flex items-center gap-3 border-border border-b px-5 py-4">
        {ownerHref ? (
          <Link
            aria-label={ownerName}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-accent font-semibold text-accent-foreground text-sm"
            href={ownerHref}
          >
            {initials(ownerName)}
          </Link>
        ) : (
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-accent font-semibold text-accent-foreground text-sm">
            {initials(ownerName)}
          </span>
        )}
        <div className="min-w-0">
          {ownerHref ? (
            <Link className="block truncate font-semibold text-sm hover:underline" href={ownerHref}>
              {ownerName}
            </Link>
          ) : (
            <p className="truncate font-semibold text-sm">{ownerName}</p>
          )}
          <p className="truncate text-muted-foreground text-xs">
            {item.ownerUsername ? `@${item.ownerUsername}` : null}
            {item.ownerUsername && item.publishedAt ? ' · ' : null}
            {item.publishedAt ? formatRelativeDate(item.publishedAt) : null}
          </p>
        </div>
      </div>
      <Link className="block px-5 py-5" href={href}>
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-semibold text-xl tracking-tight transition-colors group-hover:text-primary">
            {item.title}
          </h2>
          <ArrowUpRight
            aria-hidden="true"
            className="mt-1 shrink-0 text-muted-foreground"
            size={18}
          />
        </div>
        <p className="mt-3 line-clamp-3 text-muted-foreground text-sm leading-relaxed">
          {item.story}
        </p>
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between font-medium text-muted-foreground text-xs">
            <span>{resolvedProgress}</span>
            <span>{progress}%</span>
          </div>
          <progress
            aria-label={`${resolvedProgress}: ${progress}%`}
            className="h-1.5 w-full overflow-hidden rounded-full accent-primary"
            max={100}
            value={progress}
          />
        </div>
      </Link>
      <div className="flex items-center justify-between border-border border-t bg-muted/50 px-5 py-3">
        <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">
          {common('openContribution')}
        </p>
        <Link className="font-semibold text-primary text-sm hover:underline" href={href}>
          {common('viewDream')}
        </Link>
      </div>
    </Card>
  );
}

export function NeedBadge({ needType }: Readonly<{ needType: string }>) {
  return (
    <span className="rounded-full bg-muted px-2.5 py-1 font-medium text-xs">
      {needTypeLabel(needType)}
    </span>
  );
}
