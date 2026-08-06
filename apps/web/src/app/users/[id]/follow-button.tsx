'use client';

import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '../../../components/ui/button';
import { apiFetch } from '../../../lib/api';

export function FollowButton({ userId }: Readonly<{ userId: string }>) {
  const social = useTranslations('social');
  const t = useTranslations('profile');
  const follow = useMutation({
    mutationFn: () => apiFetch(`/users/${userId}/follow`, { method: 'POST', body: '{}' }),
    onSuccess: () => toast.success(t('followSuccess')),
    onError: (error) => toast.error(error instanceof Error ? error.message : t('followFailed')),
  });

  return (
    <Button disabled={follow.isPending} onClick={() => follow.mutate()}>
      {social('follow')}
    </Button>
  );
}
