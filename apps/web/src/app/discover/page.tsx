import Link from 'next/link';
import { Card } from '@dreamingcloud/ui';

import { apiFetchServer } from '../../lib/api-server';

interface FeedResponse {
  data: readonly {
    id: string;
    title: string;
    slug: string;
    story: string;
    progressPercent: number;
    publishedAt: string | null;
  }[];
}

export default async function DiscoverPage() {
  let items: FeedResponse['data'] = [];
  try {
    const feed = await apiFetchServer<FeedResponse>('/feed/discover?limit=20');
    items = feed.data;
  } catch {
    const list = await apiFetchServer<FeedResponse>('/aspirations?limit=20').catch(() => ({
      data: [],
    }));
    items = list.data;
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-semibold">Découvrir</h1>
      <p className="mt-2 text-[var(--dc-color-muted)]">
        Les aspirations qui méritent davantage de visibilité.
      </p>
      <div className="mt-8 grid gap-4">
        {items.length === 0 ? (
          <Card>Aucune aspiration publiée pour le moment.</Card>
        ) : (
          items.map((item) => (
            <Link key={item.id} href={`/aspirations/${item.slug || item.id}`}>
              <Card className="transition hover:border-[var(--dc-color-primary)]">
                <h2 className="text-xl font-medium">{item.title}</h2>
                <p className="mt-2 line-clamp-3 text-sm text-[var(--dc-color-muted)]">
                  {item.story}
                </p>
              </Card>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}
