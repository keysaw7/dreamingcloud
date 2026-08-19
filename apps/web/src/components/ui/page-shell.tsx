import { cva, type VariantProps } from 'class-variance-authority';
import type { ReactNode } from 'react';

import { cn } from '../../lib/utils';

export const pageShellVariants = cva('mx-auto w-full min-w-0', {
  variants: {
    maxWidth: {
      sm: 'max-w-md',
      md: 'max-w-2xl',
      lg: 'max-w-3xl',
      xl: 'max-w-6xl',
      full: 'max-w-none',
    },
  },
  defaultVariants: { maxWidth: 'lg' },
});

export interface PageShellProps extends VariantProps<typeof pageShellVariants> {
  readonly children: ReactNode;
  readonly className?: string;
  readonly title?: ReactNode;
  readonly description?: ReactNode;
  readonly actions?: ReactNode;
}

export function PageShell({
  actions,
  children,
  className,
  description,
  maxWidth,
  title,
}: PageShellProps) {
  return (
    <div className={cn(pageShellVariants({ maxWidth }), className)}>
      {title || description || actions ? (
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            {title ? <h1 className="font-semibold text-3xl tracking-tight">{title}</h1> : null}
            {description ? <p className="mt-2 text-muted-foreground">{description}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
        </header>
      ) : null}
      {children}
    </div>
  );
}
