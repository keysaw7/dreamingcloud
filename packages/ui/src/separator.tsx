import type { HTMLAttributes } from 'react';

import { cn } from './cn';

export interface SeparatorProps extends HTMLAttributes<HTMLHRElement> {}

export function Separator({ className, ...props }: SeparatorProps) {
  return (
    <hr className={cn('border-0 border-t border-[var(--dc-color-border)]', className)} {...props} />
  );
}
