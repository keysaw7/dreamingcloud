import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';

import { AppShell } from '../components/app-shell';
import { Providers } from '../components/providers';
import { getCurrentUser } from '../lib/session';
import './globals.css';

const inter = Inter({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'DreamingCloud',
  description: 'Le réseau mondial des aspirations humaines.',
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const common = await getTranslations('common');
  const user = await getCurrentUser();

  return (
    <html lang={locale} className={inter.variable} suppressHydrationWarning>
      <body>
        <Providers>
          <NextIntlClientProvider messages={messages}>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2"
            >
              {common('skipToContent')}
            </a>
            <AppShell initialUser={user}>{children}</AppShell>
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}
