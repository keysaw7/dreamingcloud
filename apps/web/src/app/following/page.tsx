import Link from 'next/link';
import { Card } from '@dreamingcloud/ui';

import { apiFetchServer } from '../../lib/api-server';

interface FeedResponse {
  data: readonly {
    id: string;
    title: string;
    slug?: string;
    story?: string;
  }[];
}

export default async function FollowingPage() {
  let items: FeedResponse['data'] = [];
  try {
    const feed = await apiFetchServer<FeedResponse>('/feed/following?limit=20');
    items = feed.data;
  } catch {
    items = [];
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-semibold">Suivis</h1>
      <div className="mt-8 grid gap-4">
        {items.length === 0 ? (
          <Card>Suivez des porteurs de rêves pour alimenter ce fil.</Card>
        ) : (
          items.map((item) => (
            <Link key={item.id} href={`/aspirations/${item.slug || item.id}`}>
              <Card>
                <h2 className="text-xl font-medium">{item.title}</h2>
                {item.story ? (
                  <p className="mt-2 text-sm text-[var(--dc-color-muted)]">{item.story}</p>
                ) : null}
              </Card>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}
