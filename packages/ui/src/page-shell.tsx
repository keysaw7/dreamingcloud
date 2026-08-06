import { cva, type VariantProps } from 'class-variance-authority';
import type { ReactNode } from 'react';

import { cn } from './cn';

const pageShellVariants = cva('mx-auto w-full px-4 py-6 sm:px-6 sm:py-8', {
  variants: {
    maxWidth: {
      sm: 'max-w-[var(--dc-width-sm)]',
      md: 'max-w-[var(--dc-width-md)]',
      lg: 'max-w-[var(--dc-width-lg)]',
      xl: 'max-w-[var(--dc-width-xl)]',
      feed: 'max-w-[var(--dc-width-feed)]',
      full: 'max-w-none',
    },
    padded: {
      true: '',
      false: 'px-0 py-0 sm:px-0 sm:py-0',
    },
  },
  defaultVariants: {
    maxWidth: 'xl',
    padded: true,
  },
});

export interface PageShellProps extends VariantProps<typeof pageShellVariants> {
  readonly children: ReactNode;
  readonly className?: string;
  readonly title?: ReactNode;
  readonly description?: ReactNode;
  readonly actions?: ReactNode;
}

export function PageShell({
  children,
  className,
  maxWidth,
  padded,
  title,
  description,
  actions,
}: PageShellProps) {
  return (
    <div className={cn(pageShellVariants({ maxWidth, padded }), className)}>
      {title || description || actions ? (
        <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            {title ? (
              <h1 className="font-semibold text-3xl text-[var(--dc-color-ink)] tracking-tight">
                {title}
              </h1>
            ) : null}
            {description ? (
              <p className="mt-2 max-w-2xl text-[var(--dc-color-muted)]">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
        </header>
      ) : null}
      {children}
    </div>
  );
}
