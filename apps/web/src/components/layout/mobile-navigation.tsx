import { UserRound } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { cn } from '../../lib/utils';
import type { CurrentUser } from '../../lib/types';
import { isActive, type NavigationItem } from './navigation';

export function MobileNavigation({
  navigation,
  pathname,
  user,
}: Readonly<{
  navigation: readonly NavigationItem[];
  pathname: string;
  user: CurrentUser | null;
}>) {
  const t = useTranslations('nav');
  const mobileItems = navigation
    .filter((item) => item.visible && item.href !== '/notifications')
    .slice(0, 4);
  return (
    <nav
      aria-label={t('primaryNav')}
      className="fixed inset-x-0 bottom-0 z-40 border-border border-t bg-background/95 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden"
    >
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {mobileItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex min-h-11 min-w-11 flex-1 flex-col items-center justify-center gap-1 rounded-md px-1 font-medium text-[0.6875rem]',
              isActive(pathname, href) ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            <Icon aria-hidden="true" size={19} strokeWidth={isActive(pathname, href) ? 2.5 : 2} />
            <span className="truncate">{label}</span>
          </Link>
        ))}
        <Link
          href={user ? '/me' : '/auth/login'}
          className={cn(
            'flex min-h-11 min-w-11 flex-1 flex-col items-center justify-center gap-1 rounded-md px-1 font-medium text-[0.6875rem]',
            isActive(pathname, '/me') ? 'text-primary' : 'text-muted-foreground',
          )}
        >
          <UserRound aria-hidden="true" size={19} />
          <span className="truncate">{t('profile')}</span>
        </Link>
      </div>
    </nav>
  );
}
