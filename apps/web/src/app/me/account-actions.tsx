'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../components/ui/alert-dialog';
import { Button } from '../../components/ui/button';
import { apiFetch } from '../../lib/api';
import { logout } from '../../lib/api/auth';

export function AccountActions() {
  const router = useRouter();
  const common = useTranslations('common');
  const t = useTranslations('profile');
  const exportData = useMutation({
    mutationFn: () => apiFetch<{ data: unknown }>('/me/export'),
    onSuccess: (response) => {
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'dreamingcloud-export.json';
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success(t('exportSuccess'));
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : t('exportFailed')),
  });
  const signOut = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      router.push('/auth/login');
      router.refresh();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : t('logoutFailed')),
  });
  const removeAccount = useMutation({
    mutationFn: () => apiFetch('/me', { method: 'DELETE' }),
    onSuccess: () => {
      toast.success(t('deleteConfirm'));
      router.push('/');
      router.refresh();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : t('deleteFailed')),
  });
  const busy = exportData.isPending || signOut.isPending || removeAccount.isPending;

  return (
    <div className="mt-8 flex flex-wrap items-center gap-3 border-border border-t pt-6">
      <Button disabled={busy} variant="outline" onClick={() => exportData.mutate()}>
        {t('exportData')}
      </Button>
      <Button disabled={busy} variant="ghost" onClick={() => signOut.mutate()}>
        {common('logout')}
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button disabled={busy} variant="destructive">
            {t('deleteAccount')}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('deleteDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline">{common('cancel')}</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="destructive" onClick={() => removeAccount.mutate()}>
                {t('deleteConfirm')}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
