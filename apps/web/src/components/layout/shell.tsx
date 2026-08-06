'use client';

import { Bell, Home, MessageCircle, Plus, Shield, UserRound, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState, type ReactNode } from 'react';

import { logout } from '../../lib/api/auth';
import type { CurrentUser } from '../../lib/types';
import { Button } from '../ui/button';
import { AppSidebar } from './app-sidebar';
import { MobileNavigation } from './mobile-navigation';
import type { NavigationItem } from './navigation';

export function AppShell({
  children,
  initialUser,
}: Readonly<{ children: ReactNode; initialUser: CurrentUser | null }>) {
  const pathname = usePathname();
  const t = useTranslations('nav');
  const common = useTranslations('common');
  const [user, setUser] = useState(initialUser);
  const compact = pathname.startsWith('/auth') || pathname.startsWith('/legal');

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  const navigation: readonly NavigationItem[] = [
    { href: '/', icon: Home, label: t('home'), visible: true },
    { href: '/following', icon: Users, label: t('following'), visible: Boolean(user) },
    {
      href: user ? '/aspirations/new' : '/auth/register',
      icon: Plus,
      label: t('newAspiration'),
      visible: true,
    },
    { href: '/conversations', icon: MessageCircle, label: t('messages'), visible: Boolean(user) },
    { href: '/notifications', icon: Bell, label: t('notifications'), visible: Boolean(user) },
    { href: '/me', icon: UserRound, label: t('profile'), visible: Boolean(user) },
    { href: '/admin/reports', icon: Shield, label: t('admin'), visible: user?.role === 'admin' },
  ];

  async function onLogout() {
    try {
      await logout();
    } finally {
      setUser(null);
      window.location.assign('/');
    }
  }

  if (compact) {
    return (
      <div className="min-h-dvh">
        <header className="border-border border-b bg-background/90 backdrop-blur">
          <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between px-5">
            <Link href="/" className="font-semibold tracking-tight">
              {common('appName')}
            </Link>
            <Button asChild size="sm" variant="ghost">
              <Link href="/">{t('discover')}</Link>
            </Button>
          </div>
        </header>
        <main id="main-content">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh">
      <AppSidebar
        navigation={navigation}
        pathname={pathname}
        user={user}
        onLogout={() => void onLogout()}
      />
      <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between border-border border-b bg-background/90 px-5 backdrop-blur lg:hidden">
        <Link href="/" className="font-semibold tracking-tight">
          {common('appName')}
        </Link>
        {user ? (
          <Button asChild aria-label={t('notifications')} size="icon-sm" variant="ghost">
            <Link href="/notifications">
              <Bell aria-hidden="true" size={18} />
            </Link>
          </Button>
        ) : (
          <Button asChild size="sm">
            <Link href="/auth/login">{t('login')}</Link>
          </Button>
        )}
      </header>
      <main
        id="main-content"
        className="mx-auto w-full max-w-7xl px-4 py-6 pb-28 lg:ml-72 lg:max-w-none lg:px-10 lg:py-10 lg:pb-10"
      >
        {children}
      </main>
      <MobileNavigation navigation={navigation} pathname={pathname} user={user} />
    </div>
  );
}
