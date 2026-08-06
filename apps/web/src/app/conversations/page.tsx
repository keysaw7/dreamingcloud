import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Avatar, Card, EmptyState, PageShell } from '@dreamingcloud/ui';

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
  const user = await getCurrentUser();

  if (!user) {
    return (
      <PageShell title={t('title')}>
        <AuthGate title={t('loginPrompt')} loginLabel={nav('login')} />
      </PageShell>
    );
  }

  let items: readonly ConversationRow[] = [];
  try {
    const response = await apiFetchServer<ApiListResponse<ConversationRow>>('/conversations');
    items = response.data;
  } catch {
    items = [];
  }

  return (
    <PageShell title={t('title')} description={t('description')} maxWidth="lg">
      {items.length === 0 ? (
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
              <Link key={item.id} href={`/conversations/${item.id}`}>
                <Card variant="interactive" className="flex items-start gap-3 p-4">
                  <Avatar name={title} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{title}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-[var(--dc-color-muted)]">
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
