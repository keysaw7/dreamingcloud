import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { PageShell } from '@dreamingcloud/ui';

import { ProfileHero } from '../../../components/profile-hero';
import { Button } from '../../../components/ui/button';
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

  if (!profile) notFound();

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
    <PageShell maxWidth="lg">
      <ProfileHero
        avatarUrl={avatarUrl}
        displayName={profile.displayName}
        username={profile.username}
      >
        <p className="mt-4 whitespace-pre-wrap text-muted-foreground leading-relaxed">
          {profile.bio ?? t('noBio')}
        </p>
        <p className="mt-5 text-muted-foreground text-sm">
          {t('followers', { count: profile.followersCount })} ·{' '}
          {t('following', { count: profile.followingCount })}
        </p>
        <div className="mt-5">
          <FollowButton userId={profile.id} />
        </div>
      </ProfileHero>
      <section className="mt-10 max-w-2xl space-y-4">
        <h2 className="font-semibold text-xl tracking-tight">{t('publishedAspirations')}</h2>
        <AspirationList
          emptyTitle={t('emptyPublic')}
          items={profile.aspirations}
          progressLabel={aspirations('progress')}
        />
      </section>
      <Button asChild className="mt-8" variant="ghost">
        <Link href="/">{nav('discover')}</Link>
      </Button>
    </PageShell>
  );
}
