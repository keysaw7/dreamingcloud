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
        className="h-2 w-full appearance-none overflow-hidden rounded-full border-0 bg-muted [&::-moz-progress-bar]:bg-primary [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-primary"
        max={100}
        value={percentage}
      />
    </div>
  );
}
