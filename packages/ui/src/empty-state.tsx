import type { ReactNode } from 'react';

import { cn } from './cn';
import { Card } from './card';
import { SparklesIcon } from './icons';

export interface EmptyStateProps {
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly action?: ReactNode;
  readonly icon?: ReactNode;
  readonly className?: string;
}

export function EmptyState({ title, description, action, icon, className }: EmptyStateProps) {
  return (
    <Card variant="soft" className={cn('px-6 py-10 text-center', className)}>
      <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-[var(--dc-radius-full)] bg-[var(--dc-color-primary-soft)] text-[var(--dc-color-primary)]">
        {icon ?? <SparklesIcon />}
      </div>
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm text-[var(--dc-color-muted)]">{description}</p>
      ) : null}
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </Card>
  );
}
