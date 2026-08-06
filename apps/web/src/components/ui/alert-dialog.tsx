'use client';

import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import type { ComponentProps } from 'react';

import { buttonVariants } from './button';
import { cn } from '../../lib/utils';

export const AlertDialog = AlertDialogPrimitive.Root;
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
export const AlertDialogAction = AlertDialogPrimitive.Action;
export const AlertDialogCancel = AlertDialogPrimitive.Cancel;

export function AlertDialogContent({
  className,
  ...props
}: Readonly<ComponentProps<typeof AlertDialogPrimitive.Content>>) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-foreground/25 backdrop-blur-sm" />
      <AlertDialogPrimitive.Content
        className={cn(
          'fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-card p-6 text-card-foreground shadow-lg',
          className,
        )}
        {...props}
      />
    </AlertDialogPrimitive.Portal>
  );
}

export function AlertDialogHeader({ className, ...props }: Readonly<ComponentProps<'div'>>) {
  return <div className={cn('space-y-2 text-left', className)} {...props} />;
}

export function AlertDialogFooter({ className, ...props }: Readonly<ComponentProps<'div'>>) {
  return (
    <div
      className={cn('mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  );
}

export function AlertDialogTitle({
  className,
  ...props
}: Readonly<ComponentProps<typeof AlertDialogPrimitive.Title>>) {
  return (
    <AlertDialogPrimitive.Title className={cn('font-semibold text-lg', className)} {...props} />
  );
}

export function AlertDialogDescription({
  className,
  ...props
}: Readonly<ComponentProps<typeof AlertDialogPrimitive.Description>>) {
  return (
    <AlertDialogPrimitive.Description
      className={cn('text-muted-foreground text-sm leading-relaxed', className)}
      {...props}
    />
  );
}

export const alertDialogActionClassName = buttonVariants();
