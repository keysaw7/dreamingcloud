import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';

import { cn } from '../../lib/utils';

const alertVariants = cva('rounded-md border px-4 py-3 text-sm leading-relaxed', {
  variants: {
    variant: {
      default: 'border-border bg-muted text-foreground',
      info: 'border-border bg-muted text-foreground',
      destructive: 'border-destructive/30 bg-destructive/10 text-destructive',
      danger: 'border-destructive/30 bg-destructive/10 text-destructive',
      success: 'border-success/30 bg-success/10 text-success',
      warning: 'border-warning/30 bg-warning/10 text-warning-foreground',
    },
  },
  defaultVariants: { variant: 'default' },
});

export function Alert({
  className,
  variant,
  ...props
}: Readonly<HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>>) {
  return (
    <div
      className={cn(alertVariants({ variant }), className)}
      role={variant === 'destructive' || variant === 'warning' ? 'alert' : 'status'}
      {...props}
    />
  );
}
