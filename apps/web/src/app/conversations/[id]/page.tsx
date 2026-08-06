import { getTranslations } from 'next-intl/server';
import { PageShell } from '@dreamingcloud/ui';

import { Alert } from '../../../components/ui/alert';
import { Card } from '../../../components/ui/card';
import { apiFetchServer } from '../../../lib/api-server';
import { formatRelativeDate } from '../../../lib/format';
import type { ApiListResponse, MessageItem } from '../../../lib/types';
import { MessageComposer } from './message-composer';

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getTranslations('conversations');
  const common = await getTranslations('common');
  let messages: readonly MessageItem[] = [];
  let error: string | null = null;
  try {
    const response = await apiFetchServer<ApiListResponse<MessageItem>>(
      `/conversations/${id}/messages`,
    );
    messages = response.data;
  } catch (caughtError) {
    error = caughtError instanceof Error ? caughtError.message : common('errorGeneric');
  }

  return (
    <PageShell maxWidth="lg" title={t('threadTitle')} description={t('description')}>
      <Card className="space-y-4 border border-border p-6">
        {error ? (
          <Alert variant="destructive">{error}</Alert>
        ) : messages.length === 0 ? (
          <p className="text-muted-foreground text-sm" role="status">
            {t('noMessages')}
          </p>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <div key={message.id} className="rounded-lg border border-border bg-muted p-3">
                <p className="text-muted-foreground text-xs">
                  {formatRelativeDate(message.createdAt)}
                </p>
                <p className="mt-1 whitespace-pre-wrap">{message.body}</p>
              </div>
            ))}
          </div>
        )}
        <MessageComposer conversationId={id} />
      </Card>
    </PageShell>
  );
}
