import type { LabelHTMLAttributes, ReactNode } from 'react';

import { cn } from './cn';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  readonly children: ReactNode;
  readonly htmlFor: string;
}

export function Label({ className, children, htmlFor, ...props }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn('block text-sm font-medium text-[var(--dc-color-ink)]', className)}
      {...props}
    >
      {children}
    </label>
  );
}

export interface FieldProps {
  readonly label: ReactNode;
  readonly htmlFor: string;
  readonly hint?: ReactNode;
  readonly error?: ReactNode;
  readonly children: ReactNode;
  readonly className?: string;
}

export function Field({ label, htmlFor, hint, error, children, className }: FieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && !error ? <p className="text-xs text-[var(--dc-color-muted)]">{hint}</p> : null}
      {error ? (
        <p className="text-sm text-[var(--dc-color-danger)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const controlClassName =
  'w-full rounded-[var(--dc-radius-md)] border border-[var(--dc-color-border)] bg-[var(--dc-color-surface)] px-3 py-2 text-sm text-[var(--dc-color-ink)] outline-none transition-colors placeholder:text-[var(--dc-color-muted)] focus-visible:border-[var(--dc-color-primary)] focus-visible:ring-2 focus-visible:ring-[var(--dc-color-primary)]/25 disabled:cursor-not-allowed disabled:opacity-60';
