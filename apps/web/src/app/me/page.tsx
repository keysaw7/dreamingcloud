import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Avatar, Badge, Button, Card, PageShell, Separator } from '@dreamingcloud/ui';

import { AuthGate } from '../../features/auth/auth-gate';
import { getCurrentUser } from '../../lib/session';
import { AccountActions } from './account-actions';
import { MediaUpload } from './media-upload';
import { ProfileEditor } from './profile-editor';

export default async function MePage() {
  const t = await getTranslations('profile');
  const nav = await getTranslations('nav');
  const legal = await getTranslations('legal');
  const me = await getCurrentUser();

  if (!me) {
    return (
      <PageShell maxWidth="md" title={t('title')}>
        <AuthGate title={t('loginPrompt')} loginLabel={nav('login')} />
      </PageShell>
    );
  }

  return (
    <PageShell maxWidth="md" title={t('title')}>
      <Card variant="flush" className="overflow-hidden">
        <div className="bg-[linear-gradient(135deg,var(--dc-color-primary-soft),var(--dc-color-surface))] px-6 py-6">
          <div className="flex flex-wrap items-start gap-4">
            <Avatar name={me.displayName} size="xl" />
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-semibold tracking-tight">{me.displayName}</h2>
              <p className="mt-1 text-sm text-[var(--dc-color-muted)]">@{me.username}</p>
              <p className="mt-3 whitespace-pre-wrap text-[var(--dc-color-ink-soft)]">
                {me.bio ?? t('noBio')}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="primary">
                  {t('status')} : {me.status}
                </Badge>
                {me.role === 'admin' ? <Badge variant="warning">{nav('admin')}</Badge> : null}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 px-6 py-6">
          <div className="flex flex-wrap gap-3">
            <Link href={`/users/${me.username}`}>
              <Button variant="secondary">{t('publicProfile')}</Button>
            </Link>
            <Link href="/notifications">
              <Button variant="secondary">{nav('notifications')}</Button>
            </Link>
            <Link href="/aspirations/new">
              <Button>{nav('newAspiration')}</Button>
            </Link>
            {me.role === 'admin' ? (
              <Link href="/admin/reports">
                <Button variant="secondary">{nav('admin')}</Button>
              </Link>
            ) : null}
            <Link href="/legal/privacy">
              <Button variant="ghost">{legal('privacy')}</Button>
            </Link>
            <Link href="/legal/terms">
              <Button variant="ghost">{legal('terms')}</Button>
            </Link>
          </div>

          <Separator />
          <ProfileEditor initialBio={me.bio ?? ''} initialDisplayName={me.displayName} />
          <MediaUpload />
          <AccountActions />
        </div>
      </Card>
    </PageShell>
  );
}
