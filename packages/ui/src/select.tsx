import type { SelectHTMLAttributes } from 'react';

import { cn } from './cn';
import { controlClassName } from './field';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(controlClassName, 'appearance-none bg-[right_0.75rem_center] pr-9', className)}
      {...props}
    >
      {children}
    </select>
  );
}
