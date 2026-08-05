export const contributionStatuses = [
  'proposed',
  'in_discussion',
  'accepted',
  'declined',
  'in_progress',
  'completed',
  'cancelled',
  'disputed',
] as const;

export type ContributionStatus = (typeof contributionStatuses)[number];

const transitions: Record<ContributionStatus, readonly ContributionStatus[]> = {
  proposed: ['in_discussion', 'accepted', 'declined', 'cancelled'],
  in_discussion: ['accepted', 'declined', 'cancelled'],
  accepted: ['in_progress', 'cancelled'],
  declined: [],
  in_progress: ['completed', 'disputed', 'cancelled'],
  completed: [],
  cancelled: [],
  disputed: ['completed', 'cancelled'],
};

export function canTransition(from: ContributionStatus, to: ContributionStatus): boolean {
  return transitions[from].includes(to);
}
