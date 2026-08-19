import { ArrowRight, Plus } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { pageShellVariants } from '../../components/ui/page-shell';
import { cn } from '../../lib/utils';

export function FeedLayout({
  aside,
  children,
  composer,
  description,
  tabs,
  title,
}: Readonly<{
  title: ReactNode;
  description?: ReactNode;
  tabs?: ReactNode;
  children: ReactNode;
  composer?: ReactNode;
  aside?: ReactNode;
}>) {
  return (
    <div
      className={cn(
        pageShellVariants({ maxWidth: 'xl' }),
        aside && 'grid gap-8 xl:grid-cols-[minmax(0,1fr)_16rem] xl:items-start',
      )}
    >
      <div className="min-w-0 max-w-2xl space-y-6">
        <header>
          <h1 className="text-balance font-semibold text-3xl tracking-tight">{title}</h1>
          {description ? (
            <p className="mt-3 max-w-xl text-base text-muted-foreground leading-relaxed">
              {description}
            </p>
          ) : null}
          {tabs ? <div className="mt-7">{tabs}</div> : null}
        </header>
        {composer}
        {children}
      </div>
      {aside ? <aside className="min-w-0 space-y-5">{aside}</aside> : null}
    </div>
  );
}

export function FeedTabs({
  ariaLabel,
  items,
}: Readonly<{
  ariaLabel: string;
  items: readonly { id: string; label: string; href: string; active: boolean }[];
}>) {
  return (
    <nav aria-label={ariaLabel} className="flex max-w-full overflow-x-auto rounded-md bg-muted p-1">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          aria-current={item.active ? 'page' : undefined}
          className={cn(
            'min-h-10 shrink-0 rounded-sm px-4 py-2 font-semibold text-sm transition-colors',
            item.active
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function FeedComposerCard({
  cta,
  description,
  href,
  title,
}: Readonly<{ href: string; title: string; description: string; cta: string }>) {
  return (
    <Card className="overflow-hidden border border-border">
      <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Plus aria-hidden="true" size={20} />
          </div>
          <h2 className="font-semibold text-lg tracking-tight">{title}</h2>
          <p className="mt-1 max-w-lg text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
        </div>
        <Button asChild className="shrink-0">
          <Link href={href}>
            {cta}
            <ArrowRight aria-hidden="true" size={17} />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function FeedAsideCard({
  actionHref,
  actionLabel,
  body,
  title,
}: Readonly<{
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
}>) {
  return (
    <Card className="border-l-2 border-l-primary bg-transparent">
      <CardContent className="p-5">
        <h2 className="font-semibold text-sm">{title}</h2>
        <p className="mt-2 text-muted-foreground text-sm leading-relaxed">{body}</p>
        {actionHref && actionLabel ? (
          <Button asChild className="mt-4" size="sm" variant="link">
            <Link href={actionHref}>
              {actionLabel}
              <ArrowRight aria-hidden="true" size={15} />
            </Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
