import type { HTMLAttributes } from 'react';

import { cn } from './cn';

export interface SeparatorProps extends HTMLAttributes<HTMLHRElement> {}

export function Separator({ className, ...props }: SeparatorProps) {
  return (
    <hr className={cn('border-0 border-[var(--dc-color-border)] border-t', className)} {...props} />
  );
}
