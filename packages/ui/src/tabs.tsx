import type { ReactNode } from 'react';

import { cn } from './cn';

export interface TabItem {
  readonly id: string;
  readonly label: ReactNode;
  readonly href?: string;
  readonly active?: boolean;
  readonly onClick?: () => void;
}

export interface TabsProps {
  readonly items: readonly TabItem[];
  readonly className?: string;
  readonly ariaLabel?: string;
}

export function Tabs({ items, className, ariaLabel = 'Onglets' }: TabsProps) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex w-full gap-1 rounded-[var(--dc-radius-full)] border border-[var(--dc-color-border)] bg-[var(--dc-color-surface-muted)] p-1',
        className,
      )}
    >
      {items.map((item) => {
        const classNameItem = cn(
          'flex-1 rounded-[var(--dc-radius-full)] px-4 py-2 text-center text-sm font-medium transition-colors',
          item.active
            ? 'bg-[var(--dc-color-surface)] text-[var(--dc-color-ink)] shadow-sm'
            : 'text-[var(--dc-color-muted)] hover:text-[var(--dc-color-ink)]',
        );

        if (item.href) {
          return (
            <a
              key={item.id}
              href={item.href}
              role="tab"
              aria-selected={item.active}
              className={classNameItem}
            >
              {item.label}
            </a>
          );
        }

        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={item.active}
            className={classNameItem}
            onClick={item.onClick}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
