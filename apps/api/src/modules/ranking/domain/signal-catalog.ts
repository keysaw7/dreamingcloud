export interface SignalDefinition {
  readonly signalName: string;
  readonly value: number;
  readonly defaultWeight: number;
  readonly resolveAggregate: (event: {
    readonly aggregateType: string;
    readonly aggregateId: string;
    readonly payload: Record<string, unknown>;
  }) => { aggregateType: string; aggregateId: string } | null;
}

function aspirationFromTarget(event: {
  readonly aggregateType: string;
  readonly aggregateId: string;
  readonly payload: Record<string, unknown>;
}): { aggregateType: string; aggregateId: string } | null {
  const targetType = event.payload.targetType;
  const targetId = event.payload.targetId;
  if (targetType === 'aspiration' && typeof targetId === 'string') {
    return { aggregateType: 'aspiration', aggregateId: targetId };
  }

  if (event.aggregateType === 'aspiration') {
    return { aggregateType: 'aspiration', aggregateId: event.aggregateId };
  }

  return null;
}

function aspirationFromPayload(event: {
  readonly aggregateType: string;
  readonly aggregateId: string;
  readonly payload: Record<string, unknown>;
}): { aggregateType: string; aggregateId: string } | null {
  const aspirationId = event.payload.aspirationId;
  if (typeof aspirationId === 'string') {
    return { aggregateType: 'aspiration', aggregateId: aspirationId };
  }

  if (event.aggregateType === 'aspiration') {
    return { aggregateType: 'aspiration', aggregateId: event.aggregateId };
  }

  return null;
}

/** Maps domain event names to ranking signals (no framework deps). */
export const EVENT_SIGNAL_CATALOG: Readonly<Record<string, SignalDefinition>> = {
  'aspirations.aspiration.published.v1': {
    signalName: 'publish',
    value: 1,
    defaultWeight: 10,
    resolveAggregate: aspirationFromPayload,
  },
  'social.support.given.v1': {
    signalName: 'support',
    value: 1,
    defaultWeight: 3,
    resolveAggregate: aspirationFromTarget,
  },
  'social.comment.created.v1': {
    signalName: 'comment',
    value: 1,
    defaultWeight: 2,
    resolveAggregate: aspirationFromTarget,
  },
  'social.share.created.v1': {
    signalName: 'share',
    value: 1,
    defaultWeight: 4,
    resolveAggregate: aspirationFromTarget,
  },
  'social.save.created.v1': {
    signalName: 'save',
    value: 1,
    defaultWeight: 1,
    resolveAggregate: aspirationFromTarget,
  },
  'contributions.contribution.completed.v1': {
    signalName: 'contribution_completed',
    value: 1,
    defaultWeight: 15,
    resolveAggregate: aspirationFromPayload,
  },
  'payments.payment.succeeded.v1': {
    signalName: 'donation',
    value: 1,
    defaultWeight: 20,
    resolveAggregate: (event) => {
      const referenceType = event.payload.referenceType;
      const referenceId = event.payload.referenceId;
      if (referenceType === 'aspiration' && typeof referenceId === 'string') {
        return { aggregateType: 'aspiration', aggregateId: referenceId };
      }
      return aspirationFromPayload(event);
    },
  },
};
