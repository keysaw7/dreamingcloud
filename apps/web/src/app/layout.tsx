import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import type { ReactNode } from 'react';

import { AppShell } from '../components/app-shell';
import { getCurrentUser } from '../lib/session';
import './globals.css';

export const metadata: Metadata = {
  title: 'DreamingCloud',
  description: 'Le réseau mondial des aspirations humaines.',
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const user = await getCurrentUser();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-[var(--dc-radius-md)] focus:bg-[var(--dc-color-surface)] focus:px-3 focus:py-2"
          >
            Aller au contenu
          </a>
          <AppShell initialUser={user}>{children}</AppShell>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
