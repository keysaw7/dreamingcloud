import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from './cn';

const alertVariants = cva('rounded-[var(--dc-radius-md)] border px-4 py-3 text-sm', {
  variants: {
    variant: {
      info: 'border-[var(--dc-color-border)] bg-[var(--dc-color-canvas)] text-[var(--dc-color-ink)]',
      success:
        'border-[var(--dc-color-success)]/30 bg-[var(--dc-color-success-soft)] text-[var(--dc-color-success)]',
      warning:
        'border-[var(--dc-color-warning)]/30 bg-[var(--dc-color-warning-soft)] text-[var(--dc-color-warning)]',
      danger:
        'border-[var(--dc-color-danger)]/30 bg-[var(--dc-color-danger-soft)] text-[var(--dc-color-danger)]',
    },
  },
  defaultVariants: {
    variant: 'info',
  },
});

export interface AlertProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  readonly children: ReactNode;
}

export function Alert({ className, variant, children, ...props }: AlertProps) {
  return (
    <div
      role={variant === 'danger' || variant === 'warning' ? 'alert' : 'status'}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {children}
    </div>
  );
}
