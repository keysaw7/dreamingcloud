import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';

import { cn } from '../../lib/utils';

const cardVariants = cva('rounded-lg bg-card text-card-foreground', {
  variants: {
    variant: {
      default: 'border border-border',
      soft: 'bg-muted',
      interactive: 'border border-border transition-colors hover:border-primary/35',
      flush: 'border border-border',
    },
  },
  defaultVariants: { variant: 'default' },
});

export function Card({
  className,
  variant,
  ...props
}: Readonly<HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>>) {
  return <div className={cn(cardVariants({ variant }), className)} {...props} />;
}

export function CardHeader({ className, ...props }: Readonly<HTMLAttributes<HTMLDivElement>>) {
  return <div className={cn('flex flex-col gap-1.5 p-6', className)} {...props} />;
}

export function CardTitle({ className, ...props }: Readonly<HTMLAttributes<HTMLHeadingElement>>) {
  return <h2 className={cn('font-semibold text-xl tracking-tight', className)} {...props} />;
}

export function CardDescription({
  className,
  ...props
}: Readonly<HTMLAttributes<HTMLParagraphElement>>) {
  return (
    <p className={cn('text-muted-foreground text-sm leading-relaxed', className)} {...props} />
  );
}

export function CardContent({ className, ...props }: Readonly<HTMLAttributes<HTMLDivElement>>) {
  return <div className={cn('px-6 pb-6', className)} {...props} />;
}

export function CardFooter({ className, ...props }: Readonly<HTMLAttributes<HTMLDivElement>>) {
  return <div className={cn('flex items-center p-6 pt-0', className)} {...props} />;
}
