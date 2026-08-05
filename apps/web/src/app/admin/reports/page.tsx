import Link from 'next/link';
import { Button, Card } from '@dreamingcloud/ui';

import { apiFetchServer } from '../../../lib/api-server';
import { ResolveReportActions } from './resolve-actions';

interface ReportsResponse {
  data: Array<{
    id: string;
    reporterId: string;
    subjectType: string;
    subjectId: string;
    reason: string;
    details: string | null;
    status: string;
    createdAt: string;
  }>;
}

interface MeResponse {
  data: { role?: string };
}

export default async function AdminReportsPage() {
  let me: MeResponse['data'] | null = null;
  try {
    const response = await apiFetchServer<MeResponse>('/me');
    me = response.data;
  } catch {
    me = null;
  }

  if (!me) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <Card>
          <p>Connectez-vous pour accéder à la modération.</p>
          <Link href="/auth/login" className="mt-4 inline-block">
            <Button>Connexion</Button>
          </Link>
        </Card>
      </main>
    );
  }

  let reports: ReportsResponse['data'] = [];
  let error: string | null = null;
  try {
    const response = await apiFetchServer<ReportsResponse>('/moderation/reports');
    reports = response.data;
  } catch (err) {
    error = err instanceof Error ? err.message : 'Accès refusé';
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold">Signalements ouverts</h1>
      {error ? (
        <Card className="mt-6">
          <p className="text-sm text-[var(--dc-color-danger)]">{error}</p>
          <p className="mt-2 text-sm text-[var(--dc-color-muted)]">
            Cette page est réservée aux administrateurs.
          </p>
        </Card>
      ) : (
        <div className="mt-6 space-y-3">
          {reports.length === 0 ? (
            <Card>
              <p className="text-sm text-[var(--dc-color-muted)]">Aucun signalement ouvert.</p>
            </Card>
          ) : (
            reports.map((report) => (
              <Card key={report.id}>
                <p className="text-sm font-medium">
                  {report.subjectType} · {report.reason}
                </p>
                <p className="mt-1 text-sm text-[var(--dc-color-muted)]">
                  {report.subjectId} · {new Date(report.createdAt).toLocaleString('fr-FR')}
                </p>
                {report.details ? <p className="mt-2 text-sm">{report.details}</p> : null}
                <ResolveReportActions reportId={report.id} />
              </Card>
            ))
          )}
        </div>
      )}
    </main>
  );
}
