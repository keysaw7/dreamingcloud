import { Card } from '@dreamingcloud/ui';

import { apiFetchServer } from '../../../lib/api-server';
import { MessageComposer } from './message-composer';

interface MessagesResponse {
  data: readonly {
    id: string;
    senderId: string;
    body: string;
    createdAt: string;
  }[];
}

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let messages: MessagesResponse['data'] = [];
  try {
    const response = await apiFetchServer<MessagesResponse>(`/conversations/${id}/messages`);
    messages = response.data;
  } catch {
    messages = [];
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Conversation</h1>
      <Card className="mt-6 space-y-4">
        {messages.length === 0 ? (
          <p className="text-sm text-[var(--dc-color-muted)]">Aucun message pour l’instant.</p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className="rounded-[var(--dc-radius-md)] bg-[var(--dc-color-canvas)] p-3"
            >
              <p className="text-xs text-[var(--dc-color-muted)]">
                {new Date(message.createdAt).toLocaleString('fr-FR')}
              </p>
              <p className="mt-1 whitespace-pre-wrap">{message.body}</p>
            </div>
          ))
        )}
        <MessageComposer conversationId={id} />
      </Card>
    </main>
  );
}
