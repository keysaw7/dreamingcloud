'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Alert, Button } from '@dreamingcloud/ui';

import { apiFetch } from '../../lib/api';
import { logout } from '../../lib/api/auth';

export function AccountActions() {
  const router = useRouter();
  const common = useTranslations('common');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function exportData() {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const response = await apiFetch<{ data: unknown }>('/me/export');
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'dreamingcloud-export.json';
      anchor.click();
      URL.revokeObjectURL(url);
      setMessage('Export téléchargé.');
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : 'Export impossible');
    } finally {
      setBusy(false);
    }
  }

  async function onLogout() {
    setBusy(true);
    try {
      await logout();
      router.push('/auth/login');
      router.refresh();
    } catch (logoutError) {
      setError(logoutError instanceof Error ? logoutError.message : 'Déconnexion impossible');
      setBusy(false);
    }
  }

  async function deleteAccount() {
    if (!window.confirm('Supprimer définitivement votre compte ?')) {
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await apiFetch('/me', { method: 'DELETE' });
      router.push('/');
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Suppression impossible');
      setBusy(false);
    }
  }

  return (
    <div className="mt-6 space-y-3 border-t border-[var(--dc-color-border)] pt-6">
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" disabled={busy} onClick={() => void exportData()}>
          Exporter mes données
        </Button>
        <Button variant="ghost" disabled={busy} onClick={() => void onLogout()}>
          {common('logout')}
        </Button>
        <Button variant="ghost" disabled={busy} onClick={() => void deleteAccount()}>
          Supprimer mon compte
        </Button>
      </div>
      {error ? <Alert variant="danger">{error}</Alert> : null}
      {message ? <Alert variant="success">{message}</Alert> : null}
    </div>
  );
}
