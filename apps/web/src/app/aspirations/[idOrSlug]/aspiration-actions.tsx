'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@dreamingcloud/ui';

import { apiFetch } from '../../../lib/api';

interface ContributionItem {
  id: string;
  status: string;
  contributionType: string;
  description: string;
  contributorId: string;
  conversationId: string | null;
}

export function AspirationActions({ aspirationId }: { aspirationId: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [contributions, setContributions] = useState<ContributionItem[]>([]);

  async function refreshContributions() {
    try {
      const response = await apiFetch<{ data: ContributionItem[] }>(
        `/aspirations/${aspirationId}/contributions`,
      );
      setContributions(response.data);
    } catch {
      setContributions([]);
    }
  }

  useEffect(() => {
    void refreshContributions();
  }, [aspirationId]);

  async function support() {
    try {
      await apiFetch(`/aspirations/${aspirationId}/support`, { method: 'POST', body: '{}' });
      setMessage('Merci pour votre soutien.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Action impossible');
    }
  }

  async function save() {
    try {
      await apiFetch(`/aspirations/${aspirationId}/save`, { method: 'POST', body: '{}' });
      setMessage('Aspiration enregistrée.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Action impossible');
    }
  }

  async function followOwner(ownerId: string) {
    try {
      await apiFetch(`/users/${ownerId}/follow`, { method: 'POST', body: '{}' });
      setMessage('Vous suivez désormais ce porteur.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Action impossible');
    }
  }

  async function proposeHelp() {
    const description = window.prompt('Décrivez votre aide (compétence, temps, matériel…)');
    if (!description || description.length < 10) {
      return;
    }

    try {
      await apiFetch(`/aspirations/${aspirationId}/contributions`, {
        method: 'POST',
        body: JSON.stringify({
          contributionType: 'skill',
          description,
        }),
      });
      setMessage('Contribution proposée. Le porteur pourra l’accepter.');
      await refreshContributions();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Action impossible');
    }
  }

  async function transition(id: string, to: string) {
    try {
      const result = await apiFetch<{ data: { conversationId: string | null } }>(
        `/contributions/${id}/transitions`,
        {
          method: 'POST',
          body: JSON.stringify({ to }),
        },
      );
      setMessage(`Contribution → ${to}`);
      await refreshContributions();
      if (result.data.conversationId) {
        setMessage(`Contribution → ${to}. Conversation ouverte.`);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Transition impossible');
    }
  }

  async function report() {
    const reason = window.prompt('Motif du signalement');
    if (!reason || reason.length < 3) {
      return;
    }

    try {
      await apiFetch('/reports', {
        method: 'POST',
        body: JSON.stringify({
          subjectType: 'aspiration',
          subjectId: aspirationId,
          reason,
          details: null,
        }),
      });
      setMessage('Signalement envoyé.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Signalement impossible');
    }
  }

  async function submitComment() {
    if (comment.trim().length < 2) {
      return;
    }

    try {
      await apiFetch(`/aspirations/${aspirationId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ body: comment.trim(), parentId: null }),
      });
      setComment('');
      setMessage('Commentaire publié.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Commentaire impossible');
    }
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap gap-3">
        <Button onClick={support}>Je soutiens</Button>
        <Button variant="secondary" onClick={proposeHelp}>
          Proposer mon aide
        </Button>
        <Button variant="ghost" onClick={save}>
          Enregistrer
        </Button>
        <Button variant="ghost" onClick={report}>
          Signaler
        </Button>
      </div>

      <div className="space-y-2">
        <label className="block text-sm">
          Commentaire
          <textarea
            className="mt-1 w-full rounded-[var(--dc-radius-md)] border border-[var(--dc-color-border)] px-3 py-2"
            rows={3}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />
        </label>
        <Button variant="secondary" onClick={submitComment}>
          Publier le commentaire
        </Button>
      </div>

      {contributions.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-lg font-medium">Contributions</h2>
          {contributions.map((item) => (
            <div
              key={item.id}
              className="rounded-[var(--dc-radius-md)] border border-[var(--dc-color-border)] p-3"
            >
              <p className="text-sm font-medium">
                {item.contributionType} · {item.status}
              </p>
              <p className="mt-1 text-sm text-[var(--dc-color-muted)]">{item.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {item.status === 'proposed' ? (
                  <>
                    <Button size="sm" onClick={() => transition(item.id, 'accepted')}>
                      Accepter
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => transition(item.id, 'declined')}
                    >
                      Refuser
                    </Button>
                  </>
                ) : null}
                {item.status === 'accepted' ? (
                  <Button size="sm" onClick={() => transition(item.id, 'in_progress')}>
                    Démarrer
                  </Button>
                ) : null}
                {item.status === 'in_progress' ? (
                  <Button size="sm" onClick={() => transition(item.id, 'completed')}>
                    Confirmer la réalisation
                  </Button>
                ) : null}
                {item.conversationId ? (
                  <Link href={`/conversations/${item.conversationId}`}>
                    <Button size="sm" variant="ghost">
                      Conversation
                    </Button>
                  </Link>
                ) : null}
                <Button size="sm" variant="ghost" onClick={() => followOwner(item.contributorId)}>
                  Suivre le contributeur
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {message ? <p className="w-full text-sm text-[var(--dc-color-muted)]">{message}</p> : null}
    </div>
  );
}
