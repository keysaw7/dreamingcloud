'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@dreamingcloud/ui';

import { apiFetch } from '../../../lib/api';

interface NeedItem {
  id: string;
  title: string;
  needType: string;
}

interface ContributionItem {
  id: string;
  status: string;
  contributionType: string;
  description: string;
  contributorId: string;
  ownerId: string;
  needId: string | null;
  conversationId: string | null;
  completedByContributorAt: string | null;
  completedByOwnerAt: string | null;
}

interface CommentItem {
  id: string;
  authorId: string;
  authorUsername: string;
  authorDisplayName: string;
  body: string;
  createdAt: string;
}

const CONTRIBUTION_TYPES = [
  'skill',
  'time',
  'material',
  'advice',
  'contact',
  'mentorship',
  'other',
] as const;

const REPORT_REASONS = [
  'Spam ou publicité',
  'Contenu offensant',
  'Harcèlement',
  'Informations trompeuses',
  'Autre',
] as const;

export function AspirationActions({
  aspirationId,
  ownerId,
  needs,
}: {
  aspirationId: string;
  ownerId: string;
  needs: readonly NeedItem[];
}) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [contributions, setContributions] = useState<ContributionItem[]>([]);
  const [showPropose, setShowPropose] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [proposeType, setProposeType] = useState<(typeof CONTRIBUTION_TYPES)[number]>('skill');
  const [proposeNeedId, setProposeNeedId] = useState('');
  const [proposeDescription, setProposeDescription] = useState('');
  const [reportReason, setReportReason] = useState<(typeof REPORT_REASONS)[number]>(
    REPORT_REASONS[0],
  );
  const [reportDetails, setReportDetails] = useState('');

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

  async function refreshComments() {
    try {
      const response = await apiFetch<{ data: CommentItem[] }>(
        `/aspirations/${aspirationId}/comments?limit=50`,
      );
      setComments(response.data);
    } catch {
      setComments([]);
    }
  }

  useEffect(() => {
    void apiFetch<{ data: { id: string } }>('/me')
      .then((response) => setCurrentUserId(response.data.id))
      .catch(() => setCurrentUserId(null));
    void refreshContributions();
    void refreshComments();
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

  async function followOwner(targetId: string) {
    try {
      await apiFetch(`/users/${targetId}/follow`, { method: 'POST', body: '{}' });
      setMessage('Vous suivez désormais ce porteur.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Action impossible');
    }
  }

  async function proposeHelp(event: React.FormEvent) {
    event.preventDefault();
    if (proposeDescription.trim().length < 10) {
      setMessage('Décrivez votre aide en au moins 10 caractères.');
      return;
    }

    try {
      await apiFetch(`/aspirations/${aspirationId}/contributions`, {
        method: 'POST',
        body: JSON.stringify({
          contributionType: proposeType,
          description: proposeDescription.trim(),
          needId: proposeNeedId || null,
        }),
      });
      setMessage('Contribution proposée. Le porteur pourra l’accepter.');
      setShowPropose(false);
      setProposeDescription('');
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

  async function report(event: React.FormEvent) {
    event.preventDefault();
    try {
      await apiFetch('/reports', {
        method: 'POST',
        body: JSON.stringify({
          subjectType: 'aspiration',
          subjectId: aspirationId,
          reason: reportReason,
          details: reportDetails.trim() || null,
        }),
      });
      setMessage('Signalement envoyé.');
      setShowReport(false);
      setReportDetails('');
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
      await refreshComments();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Commentaire impossible');
    }
  }

  const isOwner = currentUserId !== null && currentUserId === ownerId;
  const canPropose = currentUserId !== null && !isOwner;

  function confirmationLabel(item: ContributionItem): string | null {
    if (item.status !== 'in_progress' && item.status !== 'disputed') {
      return null;
    }
    const meConfirmed =
      (isOwner && item.completedByOwnerAt) ||
      (currentUserId === item.contributorId && item.completedByContributorAt);
    const otherConfirmed =
      (isOwner && item.completedByContributorAt) ||
      (currentUserId === item.contributorId && item.completedByOwnerAt);

    if (meConfirmed && !otherConfirmed) {
      return 'En attente de la confirmation de l’autre partie.';
    }
    if (!meConfirmed && otherConfirmed) {
      return 'L’autre partie a confirmé. À votre tour.';
    }
    return null;
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap gap-3">
        <Link href={`/users/${ownerId}`}>
          <Button variant="ghost">Voir le porteur</Button>
        </Link>
        {!isOwner ? (
          <Button variant="ghost" onClick={() => followOwner(ownerId)}>
            Suivre le porteur
          </Button>
        ) : null}
        <Button onClick={support}>Je soutiens</Button>
        {canPropose ? (
          <Button variant="secondary" onClick={() => setShowPropose((value) => !value)}>
            Proposer mon aide
          </Button>
        ) : null}
        <Button variant="ghost" onClick={save}>
          Enregistrer
        </Button>
        <Button variant="ghost" onClick={() => setShowReport((value) => !value)}>
          Signaler
        </Button>
      </div>

      {showPropose ? (
        <form
          onSubmit={proposeHelp}
          className="space-y-3 rounded-[var(--dc-radius-md)] border border-[var(--dc-color-border)] p-4"
        >
          <h3 className="font-medium">Proposer une contribution</h3>
          <label className="block text-sm">
            Type
            <select
              className="mt-1 w-full rounded-[var(--dc-radius-md)] border border-[var(--dc-color-border)] px-3 py-2"
              value={proposeType}
              onChange={(event) =>
                setProposeType(event.target.value as (typeof CONTRIBUTION_TYPES)[number])
              }
            >
              {CONTRIBUTION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Besoin concerné (optionnel)
            <select
              className="mt-1 w-full rounded-[var(--dc-radius-md)] border border-[var(--dc-color-border)] px-3 py-2"
              value={proposeNeedId}
              onChange={(event) => setProposeNeedId(event.target.value)}
            >
              <option value="">Aucun besoin précis</option>
              {needs.map((need) => (
                <option key={need.id} value={need.id}>
                  {need.title} · {need.needType}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Description
            <textarea
              className="mt-1 w-full rounded-[var(--dc-radius-md)] border border-[var(--dc-color-border)] px-3 py-2"
              rows={4}
              value={proposeDescription}
              onChange={(event) => setProposeDescription(event.target.value)}
              required
              minLength={10}
            />
          </label>
          <Button type="submit">Envoyer la proposition</Button>
        </form>
      ) : null}

      {showReport ? (
        <form
          onSubmit={report}
          className="space-y-3 rounded-[var(--dc-radius-md)] border border-[var(--dc-color-border)] p-4"
        >
          <h3 className="font-medium">Signaler cette aspiration</h3>
          <label className="block text-sm">
            Motif
            <select
              className="mt-1 w-full rounded-[var(--dc-radius-md)] border border-[var(--dc-color-border)] px-3 py-2"
              value={reportReason}
              onChange={(event) =>
                setReportReason(event.target.value as (typeof REPORT_REASONS)[number])
              }
            >
              {REPORT_REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Détails (optionnel)
            <textarea
              className="mt-1 w-full rounded-[var(--dc-radius-md)] border border-[var(--dc-color-border)] px-3 py-2"
              rows={3}
              value={reportDetails}
              onChange={(event) => setReportDetails(event.target.value)}
            />
          </label>
          <Button type="submit" variant="secondary">
            Envoyer le signalement
          </Button>
        </form>
      ) : null}

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

      <div className="space-y-3">
        <h2 className="text-lg font-medium">Commentaires</h2>
        {comments.length === 0 ? (
          <p className="text-sm text-[var(--dc-color-muted)]">Aucun commentaire pour le moment.</p>
        ) : (
          comments.map((item) => (
            <div
              key={item.id}
              className="rounded-[var(--dc-radius-md)] border border-[var(--dc-color-border)] p-3"
            >
              <p className="text-sm">
                <Link
                  href={`/users/${item.authorUsername}`}
                  className="font-medium text-[var(--dc-color-primary)]"
                >
                  {item.authorDisplayName}
                </Link>
                <span className="text-[var(--dc-color-muted)]">
                  {' '}
                  · {new Date(item.createdAt).toLocaleString('fr-FR')}
                </span>
              </p>
              <p className="mt-1 text-sm whitespace-pre-wrap">{item.body}</p>
            </div>
          ))
        )}
      </div>

      {contributions.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-lg font-medium">Contributions</h2>
          {contributions.map((item) => {
            const actorIsOwner = currentUserId === item.ownerId;
            const actorIsContributor = currentUserId === item.contributorId;
            const confirmHint = confirmationLabel(item);
            const canConfirm =
              (item.status === 'in_progress' || item.status === 'disputed') &&
              ((actorIsOwner && !item.completedByOwnerAt) ||
                (actorIsContributor && !item.completedByContributorAt));

            return (
              <div
                key={item.id}
                className="rounded-[var(--dc-radius-md)] border border-[var(--dc-color-border)] p-3"
              >
                <p className="text-sm font-medium">
                  {item.contributionType} · {item.status}
                </p>
                <p className="mt-1 text-sm text-[var(--dc-color-muted)]">{item.description}</p>
                {confirmHint ? (
                  <p className="mt-2 text-sm text-[var(--dc-color-primary)]">{confirmHint}</p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.status === 'proposed' && actorIsOwner ? (
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
                  {item.status === 'accepted' && (actorIsOwner || actorIsContributor) ? (
                    <Button size="sm" onClick={() => transition(item.id, 'in_progress')}>
                      Démarrer
                    </Button>
                  ) : null}
                  {canConfirm ? (
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
                  <Link href={`/users/${item.contributorId}`}>
                    <Button size="sm" variant="ghost">
                      Profil contributeur
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {message ? <p className="w-full text-sm text-[var(--dc-color-muted)]">{message}</p> : null}
    </div>
  );
}
