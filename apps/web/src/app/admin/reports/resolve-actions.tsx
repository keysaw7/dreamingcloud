'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Alert } from '../../../components/ui/alert';
import { Button } from '../../../components/ui/button';
import { apiFetch } from '../../../lib/api';

export function ResolveReportActions({ reportId }: { reportId: string }) {
  const router = useRouter();
  const t = useTranslations('admin');
  const [feedback, setFeedback] = useState<{
    message: string;
    variant: 'destructive' | 'success';
  } | null>(null);
  const [busy, setBusy] = useState(false);

  async function resolve(action: 'dismiss' | 'remove') {
    setFeedback(null);
    setBusy(true);
    try {
      await apiFetch(`/moderation/reports/${reportId}/resolve`, {
        method: 'POST',
        body: JSON.stringify({
          action,
          reason: action === 'dismiss' ? t('dismissReason') : t('removeReason'),
        }),
      });
      setFeedback({ message: t('resolveSuccess'), variant: 'success' });
      router.refresh();
    } catch (error) {
      setFeedback({
        message: error instanceof Error ? error.message : t('resolveError'),
        variant: 'destructive',
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2" aria-busy={busy}>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        disabled={busy}
        onClick={() => void resolve('dismiss')}
      >
        {t('dismiss')}
      </Button>
      <Button type="button" size="sm" disabled={busy} onClick={() => void resolve('remove')}>
        {t('remove')}
      </Button>
      {feedback ? (
        <Alert className="w-full" variant={feedback.variant}>
          {feedback.message}
        </Alert>
      ) : null}
    </div>
  );
}
