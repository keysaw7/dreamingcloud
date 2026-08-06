import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Avatar, Button, Card, PageShell } from '@dreamingcloud/ui';

import { AspirationList } from '../../../features/aspirations/aspiration-list';
import { apiFetchServer } from '../../../lib/api-server';
import type { ApiItemResponse, AspirationListItem } from '../../../lib/types';
import { FollowButton } from './follow-button';

interface ProfileData {
  id: string;
  username: string;
  displayName: string;
  bio: string | null;
  avatarMediaId: string | null;
  followersCount: number;
  followingCount: number;
  aspirations: readonly AspirationListItem[];
}

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getTranslations('profile');
  const aspirations = await getTranslations('aspirations');
  const nav = await getTranslations('nav');

  let profile: ProfileData | null = null;
  try {
    const response = await apiFetchServer<ApiItemResponse<ProfileData>>(`/users/${id}`);
    profile = response.data;
  } catch {
    notFound();
  }

  if (!profile) {
    notFound();
  }

  let avatarUrl: string | null = null;
  if (profile.avatarMediaId) {
    try {
      const media = await apiFetchServer<ApiItemResponse<{ publicUrl: string | null }>>(
        `/media/${profile.avatarMediaId}`,
      );
      avatarUrl = media.data.publicUrl;
    } catch {
      avatarUrl = null;
    }
  }

  return (
    <PageShell maxWidth="lg" className="max-w-[48rem]">
      <Card variant="flush">
        <div className="bg-[linear-gradient(135deg,var(--dc-color-primary-soft),var(--dc-color-surface))] px-6 py-6">
          <div className="flex flex-wrap items-start gap-4">
            <Avatar name={profile.displayName} src={avatarUrl} size="xl" />
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-semibold tracking-tight">{profile.displayName}</h1>
              <p className="mt-1 text-sm text-[var(--dc-color-muted)]">@{profile.username}</p>
              <p className="mt-4 whitespace-pre-wrap text-[var(--dc-color-ink-soft)]">
                {profile.bio ?? t('noBio')}
              </p>
              <p className="mt-4 text-sm text-[var(--dc-color-muted)]">
                {t('followers', { count: profile.followersCount })} ·{' '}
                {t('following', { count: profile.followingCount })}
              </p>
              <div className="mt-4">
                <FollowButton userId={profile.id} />
              </div>
            </div>
          </div>
        </div>
      </Card>

      <section className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">{t('publishedAspirations')}</h2>
        <AspirationList
          items={profile.aspirations}
          emptyTitle={t('emptyPublic')}
          progressLabel={aspirations('progress')}
        />
      </section>

      <div className="mt-8">
        <Link href="/">
          <Button variant="ghost">{nav('discover')}</Button>
        </Link>
      </div>
    </PageShell>
  );
}
