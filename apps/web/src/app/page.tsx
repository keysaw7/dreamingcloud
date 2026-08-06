import { getTranslations } from 'next-intl/server';

import { AspirationFeed } from '../features/aspirations/aspiration-feed';
import {
  FeedAsideCard,
  FeedComposerCard,
  FeedLayout,
  FeedTabs,
} from '../features/feed/feed-layout';
import { listDiscoverPage } from '../lib/api/aspirations.server';
import { getCurrentUser } from '../lib/session';

export default async function HomePage() {
  const t = await getTranslations('home');
  const aspirations = await getTranslations('aspirations');
  const nav = await getTranslations('nav');
  const user = await getCurrentUser();
  const page = await listDiscoverPage(10);

  return (
    <FeedLayout
      title={t('feedTitle')}
      description={t('feedDescription')}
      tabs={
        <FeedTabs
          ariaLabel={t('feedTabsLabel')}
          items={[
            {
              id: 'discover',
              label: nav('discover'),
              href: '/',
              active: true,
            },
            {
              id: 'following',
              label: nav('following'),
              href: '/following',
              active: false,
            },
          ]}
        />
      }
      composer={
        <FeedComposerCard
          href={user ? '/aspirations/new' : '/auth/register'}
          title={t('composerTitle')}
          description={t('composerDescription')}
          cta={user ? t('composerCta') : t('composerCtaGuest')}
        />
      }
      aside={
        <>
          <FeedAsideCard title={t('asideMissionTitle')} body={t('asideMissionBody')} />
          <FeedAsideCard
            title={t('asideHelpTitle')}
            body={t('asideHelpBody')}
            actionHref={user ? '/aspirations/new' : '/auth/register'}
            actionLabel={user ? t('composerCta') : t('composerCtaGuest')}
          />
        </>
      }
    >
      <AspirationFeed
        mode="discover"
        initialItems={page.items}
        initialCursor={page.cursor}
        initialHasMore={page.hasMore}
        emptyTitle={aspirations('emptyDiscover')}
        emptyDescription={t('feedEmptyDescription')}
        emptyActionHref={user ? '/aspirations/new' : '/auth/register'}
        emptyActionLabel={user ? aspirations('newTitle') : nav('register')}
      />
    </FeedLayout>
  );
}
