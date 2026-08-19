import { LogOut, Plus } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { Button } from '../ui/button';
import { Avatar } from '../ui/legacy-primitives';
import { cn } from '../../lib/utils';
import type { CurrentUser } from '../../lib/types';
import { isActive, type NavigationItem } from './navigation';

function isCreateDestination(href: string) {
  return href === '/aspirations/new' || href === '/auth/register';
}

export function AppSidebar({
  navigation,
  onLogout,
  pathname,
  user,
}: Readonly<{
  navigation: readonly NavigationItem[];
  pathname: string;
  user: CurrentUser | null;
  onLogout: () => void;
}>) {
  const t = useTranslations('nav');
  const common = useTranslations('common');
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-border border-r bg-background lg:block">
      <div className="flex h-full flex-col overflow-y-auto px-5 py-6">
        <Link href="/" className="mb-10 font-semibold text-lg tracking-tight">
          {common('appName')}
        </Link>
        <nav aria-label={t('primaryNav')} className="flex flex-1 flex-col gap-1">
          {navigation
            .filter((item) => item.visible && !isCreateDestination(item.href))
            .map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex min-h-11 items-center gap-3 rounded-md px-3 font-medium text-sm transition-colors',
                  isActive(pathname, href)
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon aria-hidden="true" size={18} />
                {label}
              </Link>
            ))}
        </nav>
        <div className="border-border border-t pt-4">
          <Button asChild className="w-full">
            <Link href={user ? '/aspirations/new' : '/auth/register'}>
              <Plus aria-hidden="true" size={18} />
              {t('newAspiration')}
            </Link>
          </Button>
          {user ? (
            <div className="mt-5 flex items-center gap-2">
              <Avatar name={user.displayName} size="md" />
              <div className="min-w-0">
                <p className="truncate font-semibold text-sm">{user.displayName}</p>
                <p className="truncate text-muted-foreground text-xs">@{user.username}</p>
              </div>
              <Button
                aria-label={common('logout')}
                className="shrink-0"
                size="icon-sm"
                variant="ghost"
                onClick={onLogout}
              >
                <LogOut aria-hidden="true" size={17} />
              </Button>
            </div>
          ) : (
            <div className="mt-5 grid gap-2">
              <Button asChild variant="outline">
                <Link href="/auth/login">{t('login')}</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/auth/register">{t('register')}</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
