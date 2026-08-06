import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from './cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-[var(--dc-radius-full)] px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-[var(--dc-color-canvas)] text-[var(--dc-color-ink)]',
        primary: 'bg-[var(--dc-color-primary)]/10 text-[var(--dc-color-primary)]',
        success: 'bg-[var(--dc-color-success-soft)] text-[var(--dc-color-success)]',
        warning: 'bg-[var(--dc-color-warning-soft)] text-[var(--dc-color-warning)]',
        danger: 'bg-[var(--dc-color-danger-soft)] text-[var(--dc-color-danger)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  readonly children: ReactNode;
}

export function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </span>
  );
}
