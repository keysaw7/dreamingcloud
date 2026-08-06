import type { LucideIcon } from 'lucide-react';

export type NavigationItem = {
  readonly href: string;
  readonly label: string;
  readonly icon: LucideIcon;
  readonly visible: boolean;
};

export function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' || pathname === '/discover' : pathname.startsWith(href);
}
