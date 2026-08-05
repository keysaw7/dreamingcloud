import { notFound } from 'next/navigation';
import { Card } from '@dreamingcloud/ui';

import { apiFetchServer } from '../../../lib/api-server';
import { AspirationActions } from './aspiration-actions';

interface AspirationResponse {
  data: {
    id: string;
    title: string;
    story: string;
    progressPercent: number;
    needs: readonly { id: string; title: string; needType: string; status: string }[];
    milestones: readonly { id: string; title: string; position: number }[];
  };
}

export default async function AspirationPage({
  params,
}: {
  params: Promise<{ idOrSlug: string }>;
}) {
  const { idOrSlug } = await params;

  let aspiration: AspirationResponse['data'] | null = null;
  try {
    const response = await apiFetchServer<AspirationResponse>(`/aspirations/${idOrSlug}`);
    aspiration = response.data;
  } catch {
    notFound();
  }

  if (!aspiration) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Card>
        <p className="text-sm text-[var(--dc-color-primary)]">
          Progression {aspiration.progressPercent}%
        </p>
        <h1 className="mt-2 text-3xl font-semibold">{aspiration.title}</h1>
        <p className="mt-4 whitespace-pre-wrap text-[var(--dc-color-ink)]">{aspiration.story}</p>
        <AspirationActions aspirationId={aspiration.id} />
      </Card>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="font-medium">Besoins</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {aspiration.needs.map((need) => (
              <li key={need.id}>
                {need.title} · {need.needType}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="font-medium">Jalons</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {aspiration.milestones.length === 0 ? (
              <li>Aucun jalon pour le moment.</li>
            ) : (
              aspiration.milestones.map((milestone) => (
                <li key={milestone.id}>
                  {milestone.position}. {milestone.title}
                </li>
              ))
            )}
          </ul>
        </Card>
      </section>
    </main>
  );
}
