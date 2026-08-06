import { getTranslations } from 'next-intl/server';

import { AspirationFeed } from '../../features/aspirations/aspiration-feed';
import { AuthGate } from '../../features/auth/auth-gate';
import {
  FeedAsideCard,
  FeedComposerCard,
  FeedLayout,
  FeedTabs,
} from '../../features/feed/feed-layout';
import { listFollowingPage } from '../../lib/api/aspirations.server';
import { getCurrentUser } from '../../lib/session';

export default async function FollowingPage() {
  const t = await getTranslations('aspirations');
  const home = await getTranslations('home');
  const nav = await getTranslations('nav');
  const user = await getCurrentUser();

  if (!user) {
    return (
      <FeedLayout title={t('followingTitle')} description={t('followingDescription')}>
        <AuthGate title={t('followingLogin')} loginLabel={nav('login')} />
      </FeedLayout>
    );
  }

  let page = {
    items: [] as Awaited<ReturnType<typeof listFollowingPage>>['items'],
    cursor: null as string | null,
    hasMore: false,
  };
  try {
    page = await listFollowingPage(10);
  } catch {
    page = { items: [], cursor: null, hasMore: false };
  }

  return (
    <FeedLayout
      title={t('followingTitle')}
      description={t('followingDescription')}
      tabs={
        <FeedTabs
          ariaLabel={home('feedTabsLabel')}
          items={[
            {
              id: 'discover',
              label: nav('discover'),
              href: '/',
              active: false,
            },
            {
              id: 'following',
              label: nav('following'),
              href: '/following',
              active: true,
            },
          ]}
        />
      }
      composer={
        <FeedComposerCard
          href="/aspirations/new"
          title={home('composerTitle')}
          description={home('composerDescription')}
          cta={home('composerCta')}
        />
      }
      aside={
        <FeedAsideCard
          title={home('asideHelpTitle')}
          body={t('followingDescription')}
          actionHref="/"
          actionLabel={nav('discover')}
        />
      }
    >
      <AspirationFeed
        mode="following"
        initialItems={page.items}
        initialCursor={page.cursor}
        initialHasMore={page.hasMore}
        emptyTitle={t('emptyFollowing')}
        emptyDescription={home('followingEmptyDescription')}
        emptyActionHref="/"
        emptyActionLabel={nav('discover')}
      />
    </FeedLayout>
  );
}
