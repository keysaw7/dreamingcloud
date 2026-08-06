import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';

import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2 py-0.5 font-medium text-xs leading-none',
  {
    variants: {
      variant: {
        default: 'border-primary/20 bg-primary/10 text-primary',
        primary: 'border-primary/20 bg-primary/10 text-primary',
        secondary: 'border-border bg-secondary text-secondary-foreground',
        success: 'border-success/30 bg-success/10 text-success',
        warning: 'border-warning/30 bg-warning/10 text-warning-foreground',
        destructive: 'border-destructive/30 bg-destructive/10 text-destructive',
        danger: 'border-destructive/30 bg-destructive/10 text-destructive',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: Readonly<HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
