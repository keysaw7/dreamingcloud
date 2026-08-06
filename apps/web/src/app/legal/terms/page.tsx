import { getTranslations } from 'next-intl/server';
import { PageShell } from '@dreamingcloud/ui';

import { Card } from '../../../components/ui/card';

export default async function TermsPage() {
  const t = await getTranslations('legal');

  return (
    <PageShell maxWidth="md" title={t('terms')}>
      <Card className="space-y-4 border border-border p-6 text-muted-foreground">
        <p>{t('termsIntro')}</p>
        <p>{t('termsContributions')}</p>
        <p>{t('termsModeration')}</p>
      </Card>
    </PageShell>
  );
}
