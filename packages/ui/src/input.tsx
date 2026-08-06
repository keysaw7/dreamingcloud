import type { InputHTMLAttributes } from 'react';

import { cn } from './cn';
import { controlClassName } from './field';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps) {
  return <input className={cn(controlClassName, className)} {...props} />;
}
