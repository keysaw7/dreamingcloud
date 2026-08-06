import { getTranslations } from 'next-intl/server';
import { PageShell } from '@dreamingcloud/ui';

import { Skeleton } from '../components/ui/skeleton';

export default async function Loading() {
  const t = await getTranslations('common');

  return (
    <PageShell maxWidth="feed">
      <div aria-busy="true" aria-live="polite" role="status">
        <span className="sr-only">{t('loading')}</span>
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="mt-4 h-24 w-full rounded-xl" />
        <div className="mt-4 grid gap-4">
          <Skeleton className="h-56 w-full rounded-xl" />
          <Skeleton className="h-56 w-full rounded-xl" />
        </div>
      </div>
    </PageShell>
  );
}
