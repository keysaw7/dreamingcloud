import { getTranslations } from 'next-intl/server';
import { Alert, Badge, Card, EmptyState, PageShell } from '@dreamingcloud/ui';

import { AuthGate } from '../../../features/auth/auth-gate';
import { apiFetchServer } from '../../../lib/api-server';
import { formatRelativeDate } from '../../../lib/format';
import { getCurrentUser } from '../../../lib/session';
import type { ApiListResponse } from '../../../lib/types';
import { ResolveReportActions } from './resolve-actions';

interface ReportItem {
  id: string;
  reporterId: string;
  subjectType: string;
  subjectId: string;
  reason: string;
  details: string | null;
  status: string;
  createdAt: string;
}

export default async function AdminReportsPage() {
  const t = await getTranslations('admin');
  const nav = await getTranslations('nav');
  const me = await getCurrentUser();

  if (!me) {
    return (
      <PageShell title={t('reportsTitle')} maxWidth="lg">
        <AuthGate title={t('loginPrompt')} loginLabel={nav('login')} />
      </PageShell>
    );
  }

  let reports: ReportItem[] = [];
  let error: string | null = null;
  try {
    const response = await apiFetchServer<ApiListResponse<ReportItem>>('/moderation/reports');
    reports = [...response.data];
  } catch (err) {
    error = err instanceof Error ? err.message : 'Accès refusé';
  }

  return (
    <PageShell title={t('reportsTitle')} maxWidth="lg">
      {error ? (
        <Alert variant="danger">
          <p className="font-medium">{error}</p>
          <p className="mt-1">{t('loginPrompt')}</p>
        </Alert>
      ) : reports.length === 0 ? (
        <EmptyState title={t('empty')} />
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <Card key={report.id} className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold">
                  {report.subjectType} · {report.reason}
                </p>
                <Badge variant="warning">{report.status}</Badge>
              </div>
              <p className="text-sm text-[var(--dc-color-muted)]">
                {report.subjectId} · {formatRelativeDate(report.createdAt)}
              </p>
              {report.details ? <p className="text-sm">{report.details}</p> : null}
              <ResolveReportActions reportId={report.id} />
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}
