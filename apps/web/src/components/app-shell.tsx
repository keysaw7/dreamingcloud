'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState, type ReactNode } from 'react';
import {
  Avatar,
  BellIcon,
  Button,
  cn,
  CompassIcon,
  HomeIcon,
  LogOutIcon,
  MessageIcon,
  PlusIcon,
  ShieldIcon,
  UserIcon,
  UsersIcon,
} from '@dreamingcloud/ui';

import { logout } from '../lib/api/auth';
import type { CurrentUser } from '../lib/types';

function isCompactRoute(pathname: string): boolean {
  return pathname.startsWith('/auth') || pathname.startsWith('/legal');
}

function NavItem({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-[var(--dc-radius-md)] px-3 py-2.5 text-sm font-medium transition-colors',
        active
          ? 'bg-[var(--dc-color-primary-soft)] text-[var(--dc-color-primary)]'
          : 'text-[var(--dc-color-ink-soft)] hover:bg-[var(--dc-color-canvas-elevated)] hover:text-[var(--dc-color-ink)]',
      )}
    >
      <span className="text-current">{icon}</span>
      <span className="truncate">{label}</span>
    </Link>
  );
}

function MobileNavItem({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex min-w-0 flex-1 flex-col items-center gap-1 rounded-[var(--dc-radius-md)] px-1 py-2 text-[11px] font-medium transition-colors',
        active ? 'text-[var(--dc-color-primary)]' : 'text-[var(--dc-color-muted)]',
      )}
    >
      <span
        className={cn(
          'inline-flex h-9 w-9 items-center justify-center rounded-[var(--dc-radius-full)]',
          active && 'bg-[var(--dc-color-primary-soft)]',
        )}
      >
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </Link>
  );
}

export function AppShell({
  initialUser,
  children,
}: {
  initialUser: CurrentUser | null;
  children: ReactNode;
}) {
  const t = useTranslations('nav');
  const common = useTranslations('common');
  const pathname = usePathname();
  const [user, setUser] = useState(initialUser);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  async function onLogout() {
    try {
      await logout();
    } catch {
      // ignore network errors and clear local session state
    }
    setUser(null);
    window.location.href = '/';
  }

  const compact = isCompactRoute(pathname);
  const homeActive = pathname === '/';
  const discoverActive = pathname.startsWith('/discover');
  const followingActive = pathname.startsWith('/following');
  const messagesActive = pathname.startsWith('/conversations');
  const notificationsActive = pathname.startsWith('/notifications');
  const profileActive = pathname.startsWith('/me');
  const createActive = pathname.startsWith('/aspirations/new');

  if (compact) {
    return (
      <>
        <header className="sticky top-0 z-40 border-b border-[var(--dc-color-border)] bg-[var(--dc-color-surface)]/90 backdrop-blur">
          <div className="mx-auto flex max-w-[var(--dc-width-md)] items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <Link href="/" className="font-semibold tracking-tight text-[var(--dc-color-primary)]">
              {common('appName')}
            </Link>
            <div className="flex items-center gap-2">
              <Link href="/">
                <Button size="sm" variant="ghost">
                  {t('discover')}
                </Button>
              </Link>
              {!user ? (
                <Link href="/auth/login">
                  <Button size="sm">{t('login')}</Button>
                </Link>
              ) : null}
            </div>
          </div>
        </header>
        <div id="main-content">{children}</div>
      </>
    );
  }

  return (
    <>
      <div className="mx-auto flex w-full max-w-[var(--dc-width-xl)] gap-6 px-3 pb-24 pt-3 sm:px-4 lg:gap-8 lg:px-6 lg:pb-8 lg:pt-6">
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-[var(--dc-width-sidebar)] shrink-0 flex-col lg:flex">
          <div className="flex h-full flex-col rounded-[var(--dc-radius-xl)] border border-[var(--dc-color-border)] bg-[var(--dc-color-surface)] p-4 shadow-[var(--dc-shadow-sm)]">
            <Link
              href="/"
              className="mb-6 px-2 text-lg font-semibold tracking-tight text-[var(--dc-color-primary)]"
            >
              {common('appName')}
            </Link>

            <nav aria-label={t('primaryNav')} className="flex flex-1 flex-col gap-1">
              <NavItem href="/" label={t('home')} icon={<HomeIcon />} active={homeActive} />
              <NavItem
                href="/discover"
                label={t('discover')}
                icon={<CompassIcon />}
                active={discoverActive}
              />
              {user ? (
                <NavItem
                  href="/following"
                  label={t('following')}
                  icon={<UsersIcon />}
                  active={followingActive}
                />
              ) : null}
              {user ? (
                <NavItem
                  href="/conversations"
                  label={t('messages')}
                  icon={<MessageIcon />}
                  active={messagesActive}
                />
              ) : null}
              {user ? (
                <NavItem
                  href="/notifications"
                  label={t('notifications')}
                  icon={<BellIcon />}
                  active={notificationsActive}
                />
              ) : null}
              {user ? (
                <NavItem
                  href="/me"
                  label={t('profile')}
                  icon={<UserIcon />}
                  active={profileActive}
                />
              ) : null}
              {user?.role === 'admin' ? (
                <NavItem
                  href="/admin/reports"
                  label={t('admin')}
                  icon={<ShieldIcon />}
                  active={pathname.startsWith('/admin')}
                />
              ) : null}
            </nav>

            <div className="mt-4 space-y-3 border-t border-[var(--dc-color-border)] pt-4">
              <Link href={user ? '/aspirations/new' : '/auth/register'} className="block">
                <Button className="w-full">
                  <PlusIcon size={18} />
                  {t('newAspiration')}
                </Button>
              </Link>

              {user ? (
                <div className="flex items-center gap-3 rounded-[var(--dc-radius-md)] bg-[var(--dc-color-surface-muted)] p-3">
                  <Avatar name={user.displayName} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{user.displayName}</p>
                    <p className="truncate text-xs text-[var(--dc-color-muted)]">
                      @{user.username}
                    </p>
                  </div>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label={common('logout')}
                    onClick={() => void onLogout()}
                  >
                    <LogOutIcon size={16} />
                  </Button>
                </div>
              ) : (
                <div className="grid gap-2">
                  <Link href="/auth/login">
                    <Button className="w-full" variant="secondary">
                      {t('login')}
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button className="w-full" variant="soft">
                      {t('register')}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="mb-4 flex items-center justify-between gap-3 rounded-[var(--dc-radius-xl)] border border-[var(--dc-color-border)] bg-[var(--dc-color-surface)]/95 px-4 py-3 shadow-[var(--dc-shadow-sm)] backdrop-blur lg:hidden">
            <Link href="/" className="font-semibold tracking-tight text-[var(--dc-color-primary)]">
              {common('appName')}
            </Link>
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <Link href="/notifications" aria-label={t('notifications')}>
                    <Button size="icon-sm" variant={notificationsActive ? 'soft' : 'ghost'}>
                      <BellIcon size={18} />
                    </Button>
                  </Link>
                  <Link href="/me" aria-label={t('profile')}>
                    <Avatar name={user.displayName} size="sm" />
                  </Link>
                </>
              ) : (
                <Link href="/auth/login">
                  <Button size="sm">{t('login')}</Button>
                </Link>
              )}
            </div>
          </header>

          <div id="main-content">{children}</div>
        </div>
      </div>

      <nav
        aria-label={t('primaryNav')}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--dc-color-border)] bg-[var(--dc-color-surface)]/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 backdrop-blur lg:hidden"
      >
        <div className="mx-auto flex max-w-lg items-end justify-between gap-1">
          <MobileNavItem
            href="/"
            label={t('home')}
            icon={<HomeIcon size={18} />}
            active={homeActive || discoverActive}
          />
          <MobileNavItem
            href="/following"
            label={t('following')}
            icon={<UsersIcon size={18} />}
            active={followingActive}
          />
          <MobileNavItem
            href={user ? '/aspirations/new' : '/auth/register'}
            label={t('newAspiration')}
            icon={<PlusIcon size={18} />}
            active={createActive}
          />
          <MobileNavItem
            href={user ? '/conversations' : '/auth/login'}
            label={t('messages')}
            icon={<MessageIcon size={18} />}
            active={messagesActive}
          />
          <MobileNavItem
            href={user ? '/me' : '/auth/login'}
            label={t('profile')}
            icon={<UserIcon size={18} />}
            active={profileActive}
          />
        </div>
      </nav>
    </>
  );
}
