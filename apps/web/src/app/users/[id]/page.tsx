import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button, Card } from '@dreamingcloud/ui';

import { apiFetchServer } from '../../../lib/api-server';
import { FollowButton } from './follow-button';

interface ProfileResponse {
  data: {
    id: string;
    username: string;
    displayName: string;
    bio: string | null;
    avatarMediaId: string | null;
    followersCount: number;
    followingCount: number;
    aspirations: readonly {
      id: string;
      title: string;
      slug: string;
      story: string;
      progressPercent: number;
      publishedAt: string | null;
    }[];
  };
}

interface MediaResponse {
  data: { publicUrl: string | null };
}

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let profile: ProfileResponse['data'] | null = null;
  try {
    const response = await apiFetchServer<ProfileResponse>(`/users/${id}`);
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
      const media = await apiFetchServer<MediaResponse>(`/media/${profile.avatarMediaId}`);
      avatarUrl = media.data.publicUrl;
    } catch {
      avatarUrl = null;
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Card>
        <div className="flex flex-wrap items-start gap-4">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`Avatar de ${profile.displayName}`}
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--dc-color-border)] text-xl font-semibold">
              {profile.displayName.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-semibold">{profile.displayName}</h1>
            <p className="mt-1 text-sm text-[var(--dc-color-muted)]">@{profile.username}</p>
            <p className="mt-4 whitespace-pre-wrap">
              {profile.bio ?? 'Aucune bio pour le moment.'}
            </p>
            <p className="mt-4 text-sm text-[var(--dc-color-muted)]">
              {profile.followersCount} abonnés · {profile.followingCount} abonnements
            </p>
            <div className="mt-4">
              <FollowButton userId={profile.id} />
            </div>
          </div>
        </div>
      </Card>

      <section className="mt-8 space-y-4">
        <h2 className="text-xl font-medium">Aspirations publiées</h2>
        {profile.aspirations.length === 0 ? (
          <Card>
            <p className="text-sm text-[var(--dc-color-muted)]">Aucune aspiration publique.</p>
          </Card>
        ) : (
          profile.aspirations.map((item) => (
            <Link key={item.id} href={`/aspirations/${item.slug || item.id}`}>
              <Card className="transition hover:border-[var(--dc-color-primary)]">
                <h3 className="text-lg font-medium">{item.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-[var(--dc-color-muted)]">
                  {item.story}
                </p>
                <p className="mt-3 text-sm text-[var(--dc-color-primary)]">
                  Progression {item.progressPercent}%
                </p>
              </Card>
            </Link>
          ))
        )}
      </section>

      <div className="mt-8">
        <Link href="/discover">
          <Button variant="ghost">Retour à la découverte</Button>
        </Link>
      </div>
    </main>
  );
}
