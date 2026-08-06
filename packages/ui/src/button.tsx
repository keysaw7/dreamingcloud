import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from './cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-[var(--dc-radius-md)] font-medium transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--dc-color-primary)] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--dc-color-primary)] text-[var(--dc-color-primary-foreground)] shadow-sm hover:bg-[var(--dc-color-primary-hover)]',
        secondary:
          'border border-[var(--dc-color-border)] bg-[var(--dc-color-surface)] text-[var(--dc-color-ink)] hover:border-[var(--dc-color-border-strong)] hover:bg-[var(--dc-color-surface-muted)]',
        ghost: 'text-[var(--dc-color-ink)] hover:bg-[var(--dc-color-canvas-elevated)]',
        soft: 'bg-[var(--dc-color-primary-soft)] text-[var(--dc-color-primary)] hover:brightness-95',
        danger: 'bg-[var(--dc-color-danger)] text-white hover:brightness-95',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-4 text-sm',
        lg: 'h-12 px-5 text-base',
        icon: 'h-10 w-10 p-0',
        'icon-sm': 'h-8 w-8 p-0',
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
