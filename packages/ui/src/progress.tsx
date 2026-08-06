import type { HTMLAttributes } from 'react';

import { cn } from './cn';

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  readonly value: number;
  readonly label?: string;
}

export function Progress({ value, label, className, ...props }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className={cn('space-y-1.5', className)} {...props}>
      {label ? (
        <div className="flex items-center justify-between text-[var(--dc-color-muted)] text-xs">
          <span>{label}</span>
          <span>{clamped}%</span>
        </div>
      ) : null}
      <div
        className="h-2 overflow-hidden rounded-[var(--dc-radius-full)] bg-[var(--dc-color-canvas)]"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className="h-full rounded-[var(--dc-radius-full)] bg-[var(--dc-color-primary)] transition-[width]"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
