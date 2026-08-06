'use client';

import { useTranslations } from 'next-intl';
import { Alert, Button, PageShell } from '@dreamingcloud/ui';

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('common');

  return (
    <PageShell maxWidth="md">
      <Alert variant="danger">
        <p className="font-medium">{t('errorTitle')}</p>
        <p className="mt-1">{t('errorGeneric')}</p>
      </Alert>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={reset}>{t('retry')}</Button>
        <Button variant="secondary" onClick={() => (window.location.href = '/')}>
          {t('backHome')}
        </Button>
      </div>
    </PageShell>
  );
}
