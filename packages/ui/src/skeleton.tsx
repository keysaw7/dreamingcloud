import type { HTMLAttributes } from 'react';

import { cn } from './cn';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-[var(--dc-radius-md)] bg-[var(--dc-color-border)]/70',
        className,
      )}
      aria-hidden
      {...props}
    />
  );
}
