import Link from 'next/link';
import type { ReactNode } from 'react';
import { Button, Card, cn } from '@dreamingcloud/ui';

export function FeedLayout({
  title,
  description,
  tabs,
  children,
  composer,
  aside,
}: {
  title: ReactNode;
  description?: ReactNode;
  tabs?: ReactNode;
  children: ReactNode;
  composer?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,40rem)_18rem] xl:items-start">
      <div className="mx-auto w-full max-w-[var(--dc-width-feed)] space-y-4 xl:mx-0">
        <header className="rounded-[var(--dc-radius-xl)] border border-[var(--dc-color-border)] bg-[var(--dc-color-surface)] px-5 py-5 shadow-[var(--dc-shadow-sm)]">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
          {description ? (
            <p className="mt-2 text-sm text-[var(--dc-color-muted)] sm:text-base">{description}</p>
          ) : null}
          {tabs ? <div className="mt-5">{tabs}</div> : null}
        </header>
        {composer}
        {children}
      </div>

      {aside ? (
        <aside className="hidden space-y-4 xl:block">
          <div className="sticky top-6 space-y-4">{aside}</div>
        </aside>
      ) : null}
    </div>
  );
}

export function FeedTabs({
  items,
  ariaLabel,
}: {
  items: readonly { id: string; label: string; href: string; active: boolean }[];
  ariaLabel: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="inline-flex w-full gap-1 rounded-[var(--dc-radius-full)] border border-[var(--dc-color-border)] bg-[var(--dc-color-surface-muted)] p-1"
    >
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          role="tab"
          aria-selected={item.active}
          className={cn(
            'flex-1 rounded-[var(--dc-radius-full)] px-4 py-2 text-center text-sm font-medium transition-colors',
            item.active
              ? 'bg-[var(--dc-color-surface)] text-[var(--dc-color-ink)] shadow-sm'
              : 'text-[var(--dc-color-muted)] hover:text-[var(--dc-color-ink)]',
          )}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

export function FeedComposerCard({
  href,
  title,
  description,
  cta,
}: {
  href: string;
  title: string;
  description: string;
  cta: string;
}) {
  return (
    <Card className="flex flex-col gap-4 border-[var(--dc-color-primary)]/20 bg-[linear-gradient(135deg,var(--dc-color-primary-soft),var(--dc-color-surface))] sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-[var(--dc-color-primary)]">{title}</p>
        <p className="mt-1 text-sm text-[var(--dc-color-muted)]">{description}</p>
      </div>
      <Link href={href}>
        <Button>{cta}</Button>
      </Link>
    </Card>
  );
}

export function FeedAsideCard({
  title,
  body,
  actionHref,
  actionLabel,
}: {
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <Card variant="soft">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--dc-color-muted)]">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-[var(--dc-color-ink-soft)]">{body}</p>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="mt-4 inline-block">
          <Button size="sm" variant="secondary">
            {actionLabel}
          </Button>
        </Link>
      ) : null}
    </Card>
  );
}
