import type { TextareaHTMLAttributes } from 'react';

import { cn } from './cn';
import { controlClassName } from './field';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function Textarea({ className, ...props }: TextareaProps) {
  return <textarea className={cn(controlClassName, 'min-h-28 resize-y', className)} {...props} />;
}
