# Catalogue des Domain Events

Chaque événement est versionné (`<module>.<aggregate>.<past-tense>.v1`) et porte l'enveloppe suivante :

```ts
type DomainEvent<T> = {
  eventId: string;
  name: string;
  occurredAt: string;
  actorId: string | null;
  aggregateType: string;
  aggregateId: string;
  correlationId: string;
  causationId: string | null;
  payload: T;
};
```

| Domaine | Événements | Champs métier minimaux |
| --- | --- | --- |
| Identity | `identity.user.registered.v1`, `email_verified`, `profile_updated`, `suspended`, `reputation_changed` | `userId`, `email?`, `reason?`, `reputation?` |
| Aspirations | `aspirations.aspiration.created.v1`, `published`, `updated`, `milestone_completed`, `progress_changed`, `need_fulfilled`, `completed`, `archived` | `aspirationId`, `ownerId`, `status`, `progressPercent?`, `needId?` |
| Contributions | `contributions.contribution.proposed.v1`, `accepted`, `declined`, `discussion_started`, `started`, `completed`, `cancelled`, `disputed` | `contributionId`, `aspirationId`, `contributorId`, `type`, `status`, `reason?` |
| Services | `services.service.published.v1`, `requested`, `matched` | `serviceId`, `ownerId`, `skillIds`, `aspirationId?` |
| Social | `social.support.given.v1`, `support.withdrawn`, `comment.created`, `comment.deleted`, `share.created`, `save.created`, `follow.created`, `follow.removed` | `actorId`, `targetType`, `targetId`, `commentId?` |
| Payments | `payments.payment.succeeded.v1`, `failed`, `refund.issued`, `payout.paid`, `wallet.credited`, `wallet.debited`, `connect_account.verified` | `paymentId`, `referenceType`, `referenceId`, `amountMinor`, `currency` |
| Media | `media.media.uploaded.v1`, `processed`, `rejected` | `mediaId`, `ownerId`, `mimeType`, `reason?` |
| Moderation | `moderation.content.reported.v1`, `content.removed`, `user.sanctioned` | `reportId?`, `subjectType`, `subjectId`, `reason` |

## Règles

1. Le payload est validé par un schéma Zod dans `packages/contracts`.
2. Les événements ne contiennent pas de PII superflue.
3. Les consommateurs sont idempotents avec `(consumer, event_id)`.
4. Une évolution incompatible crée une nouvelle version d'événement.
