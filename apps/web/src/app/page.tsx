import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Button, Card } from '@dreamingcloud/ui';

export default async function HomePage() {
  const t = await getTranslations('common');
  const nav = await getTranslations('nav');

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center px-6 py-16">
      <Card className="w-full">
        <p className="text-sm font-medium text-[var(--dc-color-primary)]">{t('appName')}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">{t('tagline')}</h1>
        <p className="mt-4 max-w-2xl text-[var(--dc-color-muted)]">
          Exprimez un rêve. Mobilisez une communauté. Transformez une aspiration en réalité.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/discover">
            <Button>{nav('discover')}</Button>
          </Link>
          <Link href="/auth/register">
            <Button variant="secondary">{nav('register')}</Button>
          </Link>
        </div>
      </Card>
    </main>
  );
}
