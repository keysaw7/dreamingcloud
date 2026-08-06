import type { HTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';

import { cn } from '../../lib/utils';

export function Avatar({
  className,
  name,
  size = 'md',
  src,
  ...props
}: Readonly<
  HTMLAttributes<HTMLDivElement> & {
    name: string;
    src?: string | null;
    size?: 'sm' | 'md' | 'lg' | 'xl';
  }
>) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
  const sizes = {
    sm: 'size-8 text-xs',
    md: 'size-10 text-sm',
    lg: 'size-14 text-base',
    xl: 'size-20 text-xl',
  };
  return (
    <div
      aria-hidden={!name}
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent font-semibold text-accent-foreground',
        sizes[size],
        className,
      )}
      {...props}
    >
      {src ? <img alt="" className="size-full object-cover" src={src} /> : initials || '?'}
    </div>
  );
}

export function Field({
  children,
  className,
  error,
  hint,
  htmlFor,
  label,
}: Readonly<{
  label: ReactNode;
  htmlFor: string;
  hint?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
  className?: string;
}>) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="block font-medium text-sm" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint && !error ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
    </div>
  );
}

export function Select({ className, ...props }: Readonly<SelectHTMLAttributes<HTMLSelectElement>>) {
  return (
    <select
      className={cn(
        'h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export function Separator({ className, ...props }: Readonly<HTMLAttributes<HTMLHRElement>>) {
  return <hr className={cn('border-0 border-border border-t', className)} {...props} />;
}

export function Progress({
  className,
  label,
  value,
}: Readonly<{ value: number; label?: string; className?: string }>) {
  const percentage = Math.max(0, Math.min(100, value));
  return (
    <div className={cn('space-y-1.5', className)}>
      {label ? (
        <p className="flex justify-between text-muted-foreground text-xs">
          <span>{label}</span>
          <span>{percentage}%</span>
        </p>
      ) : null}
      <progress
        aria-label={label}
        className="h-1.5 w-full accent-primary"
        max={100}
        value={percentage}
      />
    </div>
  );
}

export function PageShell({
  actions,
  children,
  className,
  description,
  maxWidth = 'xl',
  padded = true,
  title,
}: Readonly<{
  children: ReactNode;
  className?: string;
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'feed' | 'full';
  padded?: boolean;
}>) {
  const widths = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-3xl',
    xl: 'max-w-6xl',
    feed: 'max-w-2xl',
    full: 'max-w-none',
  };
  return (
    <div
      className={cn(
        'mx-auto w-full',
        widths[maxWidth],
        padded && 'px-4 py-6 sm:px-6 sm:py-8',
        className,
      )}
    >
      {title || description || actions ? (
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
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
