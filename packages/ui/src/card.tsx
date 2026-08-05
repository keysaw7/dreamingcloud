import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from './cn';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  readonly children: ReactNode;
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <article
      className={cn(
        'rounded-[var(--dc-radius-lg)] border border-[var(--dc-color-border)] bg-[var(--dc-color-surface)] p-6 shadow-sm',
        className,
      )}
      {...props}
    >
      {children}
    </article>
  );
}
