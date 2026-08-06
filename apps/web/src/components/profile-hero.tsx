import type { ReactNode } from 'react';

import { Card } from './ui/card';

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function ProfileHero({
  avatarUrl,
  children,
  displayName,
  headingLevel = 'h1',
  username,
}: Readonly<{
  displayName: string;
  username: string;
  avatarUrl?: string | null;
  headingLevel?: 'h1' | 'h2';
  children: ReactNode;
}>) {
  const Heading = headingLevel;
  return (
    <Card className="border border-border">
      <div className="flex flex-wrap items-start gap-5 p-6 sm:p-8">
        <span className="inline-flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent font-semibold text-accent-foreground text-xl">
          {avatarUrl ? (
            <img alt="" className="size-full object-cover" src={avatarUrl} />
          ) : (
            initials(displayName)
          )}
        </span>
        <div className="min-w-0 flex-1">
          <Heading className="font-semibold text-2xl tracking-tight sm:text-3xl">
            {displayName}
          </Heading>
          <p className="mt-1 text-muted-foreground text-sm">@{username}</p>
          {children}
        </div>
      </div>
    </Card>
  );
}
