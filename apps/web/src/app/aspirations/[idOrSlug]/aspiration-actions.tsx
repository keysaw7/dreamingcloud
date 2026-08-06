'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Field, Select, Textarea } from '@dreamingcloud/ui';

import { listComments, listContributions } from '../../../lib/api/aspirations';
import { apiFetch } from '../../../lib/api';
import { contributionStatusLabel, formatRelativeDate } from '../../../lib/format';
import type { CommentItem, ContributionItem } from '../../../lib/types';
import { useAuthSession } from '../../../features/auth/use-auth-session';

interface NeedItem {
  id: string;
  title: string;
  needType: string;
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
  const t = useTranslations('contribution');
  const social = useTranslations('social');
  const common = useTranslations('common');
  const aspirations = useTranslations('aspirations');
  const nav = useTranslations('nav');
  const { checked: authChecked, userId: currentUserId } = useAuthSession();
  const [feedback, setFeedback] = useState<{
    message: string;
    variant: 'danger' | 'success';
  } | null>(null);
  const [busy, setBusy] = useState(false);
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
      setContributions([...(await listContributions(aspirationId))]);
    } catch {
      setContributions([]);
    }
  }

  async function refreshComments() {
    try {
      setComments([...(await listComments(aspirationId))]);
    } catch {
      setComments([]);
    }
  }

  useEffect(() => {
    void refreshContributions();
    void refreshComments();
  }, [aspirationId]);

  async function runAction(action: () => Promise<void>, successMessage: string) {
    setBusy(true);
    setFeedback(null);
    try {
      await action();
      setFeedback({ message: successMessage, variant: 'success' });
    } catch (error) {
      setFeedback({
        message: error instanceof Error ? error.message : common('errorGeneric'),
        variant: 'danger',
      });
    } finally {
      setBusy(false);
    }
  }

  async function support() {
    await runAction(
      () => apiFetch(`/aspirations/${aspirationId}/support`, { method: 'POST', body: '{}' }),
      t('supportThanks'),
    );
  }

  async function save() {
    await runAction(
      () => apiFetch(`/aspirations/${aspirationId}/save`, { method: 'POST', body: '{}' }),
      t('saved'),
    );
  }

  async function followOwner(targetId: string) {
    await runAction(
      () => apiFetch(`/users/${targetId}/follow`, { method: 'POST', body: '{}' }),
      t('followed'),
    );
  }

  async function proposeHelp(event: React.FormEvent) {
    event.preventDefault();
    if (proposeDescription.trim().length < 10) {
      setFeedback({ message: t('proposeMinLength'), variant: 'danger' });
      return;
    }

    await runAction(async () => {
      await apiFetch(`/aspirations/${aspirationId}/contributions`, {
        method: 'POST',
        body: JSON.stringify({
          contributionType: proposeType,
          description: proposeDescription.trim(),
          needId: proposeNeedId || null,
        }),
      });
      setShowPropose(false);
      setProposeDescription('');
      await refreshContributions();
    }, t('proposeSuccess'));
  }

  async function transition(id: string, to: string) {
    await runAction(
      async () => {
        const result = await apiFetch<{ data: { conversationId: string | null } }>(
          `/contributions/${id}/transitions`,
          {
            method: 'POST',
            body: JSON.stringify({ to }),
          },
        );
        await refreshContributions();
        if (result.data.conversationId) {
          setFeedback({
            message: t('transitionWithConversation', { status: to }),
            variant: 'success',
          });
        } else {
          setFeedback({ message: t('transitionSimple', { status: to }), variant: 'success' });
        }
      },
      t('transitionSimple', { status: to }),
    );
  }

  async function report(event: React.FormEvent) {
    event.preventDefault();
    await runAction(async () => {
      await apiFetch('/reports', {
        method: 'POST',
        body: JSON.stringify({
          subjectType: 'aspiration',
          subjectId: aspirationId,
          reason: reportReason,
          details: reportDetails.trim() || null,
        }),
      });
      setShowReport(false);
      setReportDetails('');
    }, t('reportSuccess'));
  }

  async function submitComment() {
    if (comment.trim().length < 2) {
      return;
    }

    await runAction(async () => {
      await apiFetch(`/aspirations/${aspirationId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ body: comment.trim(), parentId: null }),
      });
      setComment('');
      await refreshComments();
    }, t('commentSuccess'));
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
      return t('waitingOther');
    }
    if (!meConfirmed && otherConfirmed) {
      return t('waitingYou');
    }
    return null;
  }

  if (!authChecked) {
    return (
      <div aria-busy="true" className="space-y-3">
        <div className="h-12 animate-pulse rounded-[var(--dc-radius-lg)] bg-[var(--dc-color-surface-muted)]" />
        <div className="h-28 animate-pulse rounded-[var(--dc-radius-lg)] bg-[var(--dc-color-surface-muted)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {currentUserId ? (
        <div className="flex flex-wrap gap-3 rounded-[var(--dc-radius-lg)] border border-[var(--dc-color-border)] bg-[var(--dc-color-surface-muted)] p-4">
          <Button asChild variant="ghost" disabled={busy}>
            <Link href={`/users/${ownerId}`}>{aspirations('viewOwner')}</Link>
          </Button>
          {!isOwner ? (
            <Button variant="ghost" disabled={busy} onClick={() => void followOwner(ownerId)}>
              {social('follow')}
            </Button>
          ) : null}
          <Button disabled={busy} onClick={() => void support()}>
            {common('support')}
          </Button>
          {canPropose ? (
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => setShowPropose((value) => !value)}
            >
              {aspirations('proposeHelp')}
            </Button>
          ) : null}
          <Button variant="ghost" disabled={busy} onClick={() => void save()}>
            {social('save')}
          </Button>
          <Button variant="ghost" disabled={busy} onClick={() => setShowReport((value) => !value)}>
            {social('report')}
          </Button>
        </div>
      ) : (
        <Alert variant="info">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p>{aspirations('loginToAct')}</p>
            <Button asChild size="sm">
              <Link href="/auth/login">{nav('login')}</Link>
            </Button>
          </div>
        </Alert>
      )}

      {showPropose ? (
        <Card className="space-y-3 p-6">
          <form onSubmit={(event) => void proposeHelp(event)} className="space-y-3">
            <h3 className="font-semibold">{aspirations('proposeHelp')}</h3>
            <Field label={t('type')} htmlFor="propose-type">
              <Select
                id="propose-type"
                value={proposeType}
                disabled={busy}
                onChange={(event) =>
                  setProposeType(event.target.value as (typeof CONTRIBUTION_TYPES)[number])
                }
              >
                {CONTRIBUTION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t('needOptional')} htmlFor="propose-need">
              <Select
                id="propose-need"
                value={proposeNeedId}
                disabled={busy}
                onChange={(event) => setProposeNeedId(event.target.value)}
              >
                <option value="">{t('needNone')}</option>
                {needs.map((need) => (
                  <option key={need.id} value={need.id}>
                    {need.title} · {need.needType}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t('description')} htmlFor="propose-description">
              <Textarea
                id="propose-description"
                rows={4}
                value={proposeDescription}
                disabled={busy}
                onChange={(event) => setProposeDescription(event.target.value)}
                required
                minLength={10}
              />
            </Field>
            <Button type="submit" disabled={busy}>
              {t('sendProposal')}
            </Button>
          </form>
        </Card>
      ) : null}

      {showReport ? (
        <Card className="space-y-3 p-6">
          <form onSubmit={(event) => void report(event)} className="space-y-3">
            <h3 className="font-semibold">{social('report')}</h3>
            <Field label={t('reportReason')} htmlFor="report-reason">
              <Select
                id="report-reason"
                value={reportReason}
                disabled={busy}
                onChange={(event) =>
                  setReportReason(event.target.value as (typeof REPORT_REASONS)[number])
                }
              >
                {REPORT_REASONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t('reportDetails')} htmlFor="report-details">
              <Textarea
                id="report-details"
                rows={3}
                value={reportDetails}
                disabled={busy}
                onChange={(event) => setReportDetails(event.target.value)}
              />
            </Field>
            <Button type="submit" variant="secondary" disabled={busy}>
              {t('reportSubmit')}
            </Button>
          </form>
        </Card>
      ) : null}

      {currentUserId ? (
        <Card className="space-y-3 p-6">
          <Field label={social('comment')} htmlFor="comment-body">
            <Textarea
              id="comment-body"
              rows={3}
              value={comment}
              disabled={busy}
              onChange={(event) => setComment(event.target.value)}
            />
          </Field>
          <Button variant="secondary" disabled={busy} onClick={() => void submitComment()}>
            {social('publishComment')}
          </Button>
        </Card>
      ) : null}

      <section className="space-y-3">
        <h2 className="font-semibold text-lg">{aspirations('commentsTitle')}</h2>
        {comments.length === 0 ? (
          <p className="text-[var(--dc-color-muted)] text-sm">{aspirations('commentsEmpty')}</p>
        ) : (
          comments.map((item) => (
            <div
              key={item.id}
              className="rounded-[var(--dc-radius-md)] border border-[var(--dc-color-border)] bg-[var(--dc-color-surface)] p-3"
            >
              <p className="text-sm">
                <Link
                  href={`/users/${item.authorUsername}`}
                  className="font-medium text-[var(--dc-color-primary)] hover:underline"
                >
                  {item.authorDisplayName}
                </Link>
                <span className="text-[var(--dc-color-muted)]">
                  {' '}
                  · {formatRelativeDate(item.createdAt)}
                </span>
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm">{item.body}</p>
            </div>
          ))
        )}
      </section>

      {contributions.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-semibold text-lg">{aspirations('contributionsTitle')}</h2>
          {contributions.map((item) => {
            const actorIsOwner = currentUserId === item.ownerId;
            const actorIsContributor = currentUserId === item.contributorId;
            const confirmHint = confirmationLabel(item);
            const canConfirm =
              (item.status === 'in_progress' || item.status === 'disputed') &&
              ((actorIsOwner && !item.completedByOwnerAt) ||
                (actorIsContributor && !item.completedByContributorAt));

            return (
              <Card key={item.id} className="space-y-3 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-sm">{item.contributionType}</p>
                  <Badge variant="primary">{contributionStatusLabel(item.status)}</Badge>
                  <span className="sr-only">
                    {item.contributionType} · {item.status}
                  </span>
                </div>
                <p className="text-[var(--dc-color-muted)] text-sm">{item.description}</p>
                {confirmHint ? (
                  <p className="text-[var(--dc-color-primary)] text-sm">{confirmHint}</p>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  {item.status === 'proposed' && actorIsOwner ? (
                    <>
                      <Button
                        size="sm"
                        disabled={busy}
                        onClick={() => void transition(item.id, 'accepted')}
                      >
                        {t('accept')}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={busy}
                        onClick={() => void transition(item.id, 'declined')}
                      >
                        {t('decline')}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busy}
                        onClick={() => void transition(item.id, 'in_discussion')}
                      >
                        {aspirations('discuss')}
                      </Button>
                    </>
                  ) : null}
                  {item.status === 'in_discussion' && actorIsOwner ? (
                    <>
                      <Button
                        size="sm"
                        disabled={busy}
                        onClick={() => void transition(item.id, 'accepted')}
                      >
                        {t('accept')}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={busy}
                        onClick={() => void transition(item.id, 'declined')}
                      >
                        {t('decline')}
                      </Button>
                    </>
                  ) : null}
                  {item.status === 'accepted' && (actorIsOwner || actorIsContributor) ? (
                    <Button
                      size="sm"
                      disabled={busy}
                      onClick={() => void transition(item.id, 'in_progress')}
                    >
                      {t('start')}
                    </Button>
                  ) : null}
                  {canConfirm ? (
                    <Button
                      size="sm"
                      disabled={busy}
                      onClick={() => void transition(item.id, 'completed')}
                    >
                      {t('confirm')}
                    </Button>
                  ) : null}
                  {item.conversationId ? (
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/conversations/${item.conversationId}`}>
                        {t('conversation')}
                      </Link>
                    </Button>
                  ) : null}
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`/users/${item.contributorId}`}>
                      {aspirations('contributorProfile')}
                    </Link>
                  </Button>
                </div>
              </Card>
            );
          })}
        </section>
      ) : null}

      {feedback ? <Alert variant={feedback.variant}>{feedback.message}</Alert> : null}
    </div>
  );
}
