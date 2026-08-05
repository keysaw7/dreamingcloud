'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@dreamingcloud/ui';

import { apiFetch } from '../../lib/api';

export function AccountActions() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  async function exportData() {
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
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Export impossible');
    }
  }

  async function logout() {
    try {
      await apiFetch('/auth/logout', { method: 'POST', body: '{}' });
      router.push('/auth/login');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Déconnexion impossible');
    }
  }

  async function deleteAccount() {
    if (!window.confirm('Supprimer définitivement votre compte ?')) {
      return;
    }

    try {
      await apiFetch('/me', { method: 'DELETE' });
      router.push('/');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Suppression impossible');
    }
  }

  return (
    <div className="mt-6 space-y-3 border-t border-[var(--dc-color-border)] pt-6">
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={exportData}>
          Exporter mes données
        </Button>
        <Button variant="ghost" onClick={logout}>
          Se déconnecter
        </Button>
        <Button variant="ghost" onClick={deleteAccount}>
          Supprimer mon compte
        </Button>
      </div>
      {message ? <p className="text-sm text-[var(--dc-color-muted)]">{message}</p> : null}
    </div>
  );
}
