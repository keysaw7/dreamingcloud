import { getTranslations } from 'next-intl/server';
import { PageShell } from '@dreamingcloud/ui';

import { Card } from '../../../components/ui/card';

export default async function PrivacyPage() {
  const t = await getTranslations('legal');

  return (
    <PageShell maxWidth="md" title={t('privacy')}>
      <Card className="space-y-4 border border-border p-6 text-muted-foreground">
        <p>{t('privacyIntro')}</p>
        <section aria-labelledby="privacy-data">
          <h2 id="privacy-data" className="font-semibold text-foreground text-lg">
            {t('privacyDataTitle')}
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>{t('privacyDataAccount')}</li>
            <li>{t('privacyDataContent')}</li>
            <li>{t('privacyDataSecurity')}</li>
          </ul>
        </section>
        <section aria-labelledby="privacy-rights">
          <h2 id="privacy-rights" className="font-semibold text-foreground text-lg">
            {t('privacyRightsTitle')}
          </h2>
          <p className="mt-2">{t('privacyRightsDescription')}</p>
        </section>
        <section aria-labelledby="privacy-retention">
          <h2 id="privacy-retention" className="font-semibold text-foreground text-lg">
            {t('privacyRetentionTitle')}
          </h2>
          <p className="mt-2">{t('privacyRetentionDescription')}</p>
        </section>
      </Card>
    </PageShell>
  );
}
