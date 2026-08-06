import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from './cn';

const cardVariants = cva(
  'rounded-[var(--dc-radius-lg)] border border-[var(--dc-color-border)] bg-[var(--dc-color-surface)] text-[var(--dc-color-ink)]',
  {
    variants: {
      variant: {
        default: 'p-6 shadow-[var(--dc-shadow-sm)]',
        soft: 'border-transparent bg-[var(--dc-color-surface-muted)] p-6',
        interactive:
          'p-5 shadow-[var(--dc-shadow-sm)] transition-all duration-150 hover:-translate-y-0.5 hover:border-[var(--dc-color-border-strong)] hover:shadow-[var(--dc-shadow-md)]',
        flush: 'overflow-hidden p-0 shadow-[var(--dc-shadow-sm)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface CardProps extends HTMLAttributes<HTMLElement>, VariantProps<typeof cardVariants> {
  readonly children: ReactNode;
}

export function Card({ className, children, variant, ...props }: CardProps) {
  return (
    <article className={cn(cardVariants({ variant }), className)} {...props}>
      {children}
    </article>
  );
}
