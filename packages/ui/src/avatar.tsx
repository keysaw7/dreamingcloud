import type { HTMLAttributes } from 'react';

import { cn } from './cn';

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  readonly name: string;
  readonly src?: string | null;
  readonly size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-20 w-20 text-xl',
} as const;

export function Avatar({ name, src, size = 'md', className, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[var(--dc-radius-full)] bg-[var(--dc-color-primary-soft)] font-semibold text-[var(--dc-color-primary)] ring-2 ring-white',
        sizeClasses[size],
        className,
      )}
      aria-hidden={!name}
      {...props}
    >
      {src ? (
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <span>{initialsFromName(name) || '?'}</span>
      )}
    </div>
  );
}
