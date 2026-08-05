'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export function SiteHeader() {
  const t = useTranslations('nav');
  const common = useTranslations('common');

  return (
    <header className="border-b border-[var(--dc-color-border)] bg-[var(--dc-color-surface)]">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-semibold text-[var(--dc-color-primary)]">
          {common('appName')}
        </Link>
        <nav className="flex gap-4 text-sm">
          <Link href="/discover">{t('discover')}</Link>
          <Link href="/following">{t('following')}</Link>
          <Link href="/aspirations/new">{t('newAspiration')}</Link>
          <Link href="/conversations">{t('messages')}</Link>
          <Link href="/notifications">{t('notifications')}</Link>
          <Link href="/me">{t('profile')}</Link>
          <Link href="/auth/login">{t('login')}</Link>
        </nav>
      </div>
    </header>
  );
}
