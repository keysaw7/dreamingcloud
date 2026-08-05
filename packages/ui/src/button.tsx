import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from './cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-[var(--dc-radius-md)] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--dc-color-primary)] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--dc-color-primary)] text-[var(--dc-color-primary-foreground)] hover:brightness-95',
        secondary:
          'border border-[var(--dc-color-border)] bg-[var(--dc-color-surface)] text-[var(--dc-color-ink)] hover:bg-[var(--dc-color-canvas)]',
        ghost: 'text-[var(--dc-color-ink)] hover:bg-[var(--dc-color-canvas)]',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-4 text-sm',
        lg: 'h-12 px-5 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  readonly asChild?: boolean;
  readonly children: ReactNode;
}

export function Button({
  asChild = false,
  className,
  variant,
  size,
  children,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : 'button';
  return (
    <Component className={cn(buttonVariants({ variant, size }), className)} {...props}>
      {children}
    </Component>
  );
}
