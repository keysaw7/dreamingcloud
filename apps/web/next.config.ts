import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

function apiRewriteDestination(): string | null {
  const origin = process.env.API_ORIGIN?.trim();
  if (!origin) {
    return null;
  }

  const normalized = origin.replace(/\/$/u, '').replace(/\/api\/v1$/u, '');
  return `${normalized}/api/v1/:path*`;
}

const apiDestination = apiRewriteDestination();

const nextConfig: NextConfig = {
  async rewrites() {
    if (!apiDestination) {
      return [];
    }

    return [
      {
        source: '/api/v1/:path*',
        destination: apiDestination,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
