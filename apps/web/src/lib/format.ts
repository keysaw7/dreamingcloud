const relativeFormatter = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' });

export function formatRelativeDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const diffMs = date.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / 60_000);
  const absMinutes = Math.abs(diffMinutes);

  if (absMinutes < 60) {
    return relativeFormatter.format(diffMinutes, 'minute');
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return relativeFormatter.format(diffHours, 'hour');
  }

  const diffDays = Math.round(diffHours / 24);
  if (Math.abs(diffDays) < 30) {
    return relativeFormatter.format(diffDays, 'day');
  }

  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function contributionStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    proposed: 'Proposée',
    in_discussion: 'En discussion',
    accepted: 'Acceptée',
    declined: 'Refusée',
    in_progress: 'En cours',
    completed: 'Terminée',
    disputed: 'En litige',
    cancelled: 'Annulée',
  };
  return labels[status] ?? status;
}

export function needTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    skill: 'Compétence',
    material: 'Matériel',
    time: 'Temps',
    contact: 'Contact',
    other: 'Autre',
    money: 'Financier',
  };
  return labels[type] ?? type;
}
