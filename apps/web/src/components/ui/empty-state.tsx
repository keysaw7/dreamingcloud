import { InboxIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '../../lib/utils';
import { Card } from './card';

export interface EmptyStateProps {
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly action?: ReactNode;
  readonly icon?: ReactNode;
  readonly className?: string;
}

export function EmptyState({ title, description, action, icon, className }: EmptyStateProps) {
  return (
    <Card
      className={cn('border border-border bg-muted/40 px-6 py-10 text-center', className)}
      role="status"
    >
      <div
        aria-hidden="true"
        className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground"
      >
        {icon ?? <InboxIcon size={22} />}
      </div>
      <h2 className="font-semibold text-lg tracking-tight">{title}</h2>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </Card>
  );
}
