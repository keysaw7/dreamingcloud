import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { PageShell } from '@dreamingcloud/ui';

import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
export default async function NotFoundPage() {
  const t = await getTranslations('common');

  return (
    <PageShell maxWidth="md" title={t('notFoundTitle')}>
      <Card className="space-y-6 border border-border bg-muted/40 p-6 text-center" role="status">
        <p className="text-muted-foreground">{t('notFoundDescription')}</p>
        <Button asChild>
          <Link href="/">{t('backHome')}</Link>
        </Button>
      </Card>
    </PageShell>
  );
}
