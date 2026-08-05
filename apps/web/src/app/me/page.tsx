import Link from 'next/link';
import { Button, Card } from '@dreamingcloud/ui';

import { apiFetchServer } from '../../lib/api-server';
import { AccountActions } from './account-actions';
import { MediaUpload } from './media-upload';

interface MeResponse {
  data: {
    id: string;
    email: string;
    username: string;
    displayName: string;
    bio: string | null;
    status: string;
    role?: string;
  };
}

export default async function MePage() {
  let me: MeResponse['data'] | null = null;
  try {
    const response = await apiFetchServer<MeResponse>('/me');
    me = response.data;
  } catch {
    me = null;
  }

  if (!me) {
    return (
      <main className="mx-auto max-w-lg px-6 py-16">
        <Card>
          <p>Connectez-vous pour accéder à votre profil.</p>
          <Link href="/auth/login" className="mt-4 inline-block">
            <Button>Connexion</Button>
          </Link>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-16">
      <Card>
        <h1 className="text-2xl font-semibold">{me.displayName}</h1>
        <p className="mt-2 text-sm text-[var(--dc-color-muted)]">@{me.username}</p>
        <p className="mt-4">{me.bio ?? 'Aucune bio pour le moment.'}</p>
        <p className="mt-6 text-sm">Statut : {me.status}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/users/${me.username}`}>
            <Button variant="secondary">Profil public</Button>
          </Link>
          <Link href="/notifications">
            <Button variant="secondary">Notifications</Button>
          </Link>
          {me.role === 'admin' ? (
            <Link href="/admin/reports">
              <Button variant="secondary">Modération</Button>
            </Link>
          ) : null}
          <Link href="/legal/privacy">
            <Button variant="secondary">Confidentialité</Button>
          </Link>
          <Link href="/legal/terms">
            <Button variant="ghost">Conditions</Button>
          </Link>
        </div>
        <MediaUpload />
        <AccountActions />
      </Card>
    </main>
  );
}
