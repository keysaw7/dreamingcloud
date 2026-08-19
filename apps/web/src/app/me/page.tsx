import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Badge, PageShell, Separator } from '@dreamingcloud/ui';

import { ProfileHero } from '../../components/profile-hero';
import { Button } from '../../components/ui/button';
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

  const statusLabel = t.has(`statusValues.${me.status}`)
    ? t(`statusValues.${me.status}`)
    : me.status;

  return (
    <PageShell maxWidth="md" title={t('title')}>
      <ProfileHero displayName={me.displayName} headingLevel="h2" username={me.username}>
        <p className="mt-4 whitespace-pre-wrap text-muted-foreground leading-relaxed">
          {me.bio ?? t('noBio')}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Badge>
            {t('status')}: {statusLabel}
          </Badge>
          {me.role === 'admin' ? <Badge variant="warning">{nav('admin')}</Badge> : null}
        </div>
      </ProfileHero>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href={`/users/${me.username}`}>{t('publicProfile')}</Link>
        </Button>
        {me.role === 'admin' ? (
          <Button asChild variant="outline">
            <Link href="/admin/reports">{nav('admin')}</Link>
          </Button>
        ) : null}
      </div>
      <div className="mt-10 space-y-8">
        <Separator />
        <ProfileEditor initialBio={me.bio ?? ''} initialDisplayName={me.displayName} />
        <MediaUpload />
        <AccountActions />
        <div className="flex gap-4 text-muted-foreground text-sm">
          <Link className="hover:text-foreground hover:underline" href="/legal/privacy">
            {legal('privacy')}
          </Link>
          <Link className="hover:text-foreground hover:underline" href="/legal/terms">
            {legal('terms')}
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
