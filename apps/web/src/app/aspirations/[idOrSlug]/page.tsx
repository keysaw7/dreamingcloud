import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Avatar, Badge, Card, PageShell, Progress } from '@dreamingcloud/ui';

import { NeedBadge } from '../../../features/aspirations/aspiration-card';
import { getAspiration } from '../../../lib/api/aspirations.server';
import { AspirationActions } from './aspiration-actions';

export default async function AspirationPage({
  params,
}: {
  params: Promise<{ idOrSlug: string }>;
}) {
  const { idOrSlug } = await params;
  const t = await getTranslations('aspirations');
  const aspiration = await getAspiration(idOrSlug);

  if (!aspiration) {
    notFound();
  }

  const ownerName = aspiration.ownerDisplayName || aspiration.ownerUsername || t('ownerLink');
  const ownerHref = `/users/${aspiration.ownerUsername || aspiration.ownerId}`;
  const statusLabel = aspiration.status
    ? t.has(`statusValues.${aspiration.status}`)
      ? t(`statusValues.${aspiration.status}`)
      : aspiration.status
    : null;

  return (
    <PageShell maxWidth="lg">
      <Card variant="flush">
        <div className="border-border border-b bg-gradient-to-br from-accent to-card px-6 py-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary">
              {t('progress')} {aspiration.progressPercent}%
            </Badge>
            {statusLabel ? <Badge>{statusLabel}</Badge> : null}
          </div>
          <h1 className="mt-4 font-semibold text-3xl tracking-tight">{aspiration.title}</h1>
          <div className="mt-5 flex items-center gap-3">
            <Link href={ownerHref}>
              <Avatar name={ownerName} size="md" />
            </Link>
            <div>
              <p className="text-muted-foreground text-sm">{t('byOwner')}</p>
              <Link href={ownerHref} className="font-semibold text-primary hover:underline">
                {ownerName}
              </Link>
            </div>
          </div>
          <Progress className="mt-6" value={aspiration.progressPercent} label={t('progress')} />
        </div>

        <div className="space-y-8 px-6 py-6">
          <section>
            <h2 className="font-semibold text-lg">{t('tabStory')}</h2>
            <p className="mt-3 whitespace-pre-wrap text-muted-foreground leading-relaxed">
              {aspiration.story}
            </p>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <Card className="p-4" variant="soft">
              <h2 className="font-semibold">{t('openNeeds')}</h2>
              <ul className="mt-3 space-y-3 text-sm">
                {aspiration.needs.length === 0 ? (
                  <li className="text-muted-foreground">{t('emptyDiscover')}</li>
                ) : (
                  aspiration.needs.map((need) => (
                    <li key={need.id} className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium">{need.title}</span>
                      <NeedBadge needType={need.needType} />
                    </li>
                  ))
                )}
              </ul>
            </Card>
            <Card className="p-4" variant="soft">
              <h2 className="font-semibold">{t('milestones')}</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {aspiration.milestones.length === 0 ? (
                  <li className="text-muted-foreground">{t('noMilestones')}</li>
                ) : (
                  aspiration.milestones.map((milestone) => (
                    <li key={milestone.id}>
                      <span className="font-medium text-primary">{milestone.position}.</span>{' '}
                      {milestone.title}
                    </li>
                  ))
                )}
              </ul>
            </Card>
          </section>

          <AspirationActions
            aspirationId={aspiration.id}
            ownerId={aspiration.ownerId}
            ownerUsername={aspiration.ownerUsername ?? null}
            needs={aspiration.needs}
          />
        </div>
      </Card>
    </PageShell>
  );
}
