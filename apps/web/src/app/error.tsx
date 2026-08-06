'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { PageShell } from '@dreamingcloud/ui';

import { Alert } from '../components/ui/alert';
import { Button } from '../components/ui/button';
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('common');

  return (
    <PageShell maxWidth="md" title={t('errorTitle')}>
      <Alert variant="destructive">{t('errorGeneric')}</Alert>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button type="button" onClick={reset}>
          {t('retry')}
        </Button>
        <Button asChild variant="secondary">
          <Link href="/">{t('backHome')}</Link>
        </Button>
      </div>
    </PageShell>
  );
}
