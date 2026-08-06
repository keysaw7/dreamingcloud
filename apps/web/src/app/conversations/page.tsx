import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { PageShell } from '@dreamingcloud/ui';

import { Alert } from '../../components/ui/alert';
import { Card } from '../../components/ui/card';
import { EmptyState } from '../../components/ui/empty-state';
import { AuthGate } from '../../features/auth/auth-gate';
import { apiFetchServer } from '../../lib/api-server';
import { getCurrentUser } from '../../lib/session';
import type { ApiListResponse } from '../../lib/types';

interface ConversationRow {
  id: string;
  kind?: string;
  title?: string | null;
  lastMessagePreview?: string | null;
  contributionId?: string | null;
  updatedAt?: string;
}

export default async function ConversationsPage() {
  const t = await getTranslations('conversations');
  const nav = await getTranslations('nav');
  const common = await getTranslations('common');
  const user = await getCurrentUser();

  if (!user) {
    return (
      <PageShell title={t('title')}>
        <AuthGate title={t('loginPrompt')} loginLabel={nav('login')} />
      </PageShell>
    );
  }

  let items: readonly ConversationRow[] = [];
  let error: string | null = null;
  try {
    const response = await apiFetchServer<ApiListResponse<ConversationRow>>('/conversations');
    items = response.data;
  } catch (caughtError) {
    error = caughtError instanceof Error ? caughtError.message : common('errorGeneric');
  }

  return (
    <PageShell title={t('title')} description={t('description')} maxWidth="lg">
      {error ? (
        <Alert variant="destructive">{error}</Alert>
      ) : items.length === 0 ? (
        <EmptyState title={t('empty')} description={t('emptyDescription')} />
      ) : (
        <div className="grid gap-3">
          {items.map((item) => {
            const title =
              item.title?.trim() ||
              (item.contributionId
                ? `${t('untitled')} #${item.contributionId.slice(0, 6)}`
                : `${t('untitled')} #${item.id.slice(0, 6)}`);

            return (
              <Link
                key={item.id}
                href={`/conversations/${item.id}`}
                aria-label={`${t('openThread')} : ${title}`}
                className="block rounded-lg transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Card className="flex items-start gap-3 border border-border p-4 transition-colors hover:bg-accent">
                  <div
                    aria-hidden="true"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary font-semibold text-secondary-foreground text-sm"
                  >
                    {title.charAt(0).toLocaleUpperCase('fr-FR')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{title}</p>
                    <p className="mt-1 line-clamp-2 text-muted-foreground text-sm">
                      {item.lastMessagePreview ?? t('openThread')}
                    </p>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
