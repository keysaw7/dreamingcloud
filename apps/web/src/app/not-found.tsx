import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Button, EmptyState, PageShell } from '@dreamingcloud/ui';

export default async function NotFoundPage() {
  const t = await getTranslations('common');

  return (
    <PageShell maxWidth="md">
      <EmptyState
        title={t('notFoundTitle')}
        description={t('notFoundDescription')}
        action={
          <Link href="/">
            <Button>{t('backHome')}</Button>
          </Link>
        }
      />
    </PageShell>
  );
}
