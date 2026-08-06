import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';

import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'button-primary bg-primary hover:bg-primary/90',
        primary: 'button-primary bg-primary hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/75',
        outline: 'border border-border bg-background hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        soft: 'bg-accent text-accent-foreground hover:bg-accent/80',
        link: 'min-h-0 px-0 text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-11',
        sm: 'h-9 min-h-9 rounded-sm px-3 text-xs',
        lg: 'h-12 px-6 text-base',
        icon: 'h-11 min-h-11 w-11 p-0',
        'icon-sm': 'h-9 min-h-9 w-9 p-0',
      },
    },
    defaultVariants: { size: 'default', variant: 'default' },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  readonly asChild?: boolean;
}

export function Button({ asChild = false, className, size, variant, ...props }: ButtonProps) {
  const Component = asChild ? Slot : 'button';
  return <Component className={cn(buttonVariants({ className, size, variant }))} {...props} />;
}

export { buttonVariants };
