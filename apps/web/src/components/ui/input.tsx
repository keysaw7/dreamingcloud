import type { InputHTMLAttributes } from 'react';

import { cn } from '../../lib/utils';

export function Input({ className, ...props }: Readonly<InputHTMLAttributes<HTMLInputElement>>) {
  return (
    <input
      className={cn(
        'flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-none outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}
