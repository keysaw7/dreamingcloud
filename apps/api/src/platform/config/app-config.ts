import { z } from 'zod';

const environmentSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65535).default(3001),
    DATABASE_URL: z.url(),
    REDIS_URL: z.url(),
    CORS_ORIGIN: z.string().min(1).default('http://localhost:3000'),
    OUTBOX_POLL_INTERVAL_MS: z.coerce.number().int().min(100).default(1000),
    JWT_PRIVATE_KEY_PEM: z.string().min(1).default('dev-insecure-private-key'),
    JWT_PUBLIC_KEY_PEM: z.string().min(1).default('dev-insecure-public-key'),
    JWT_ACCESS_TTL_SECONDS: z.coerce.number().int().min(60).default(600),
    REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().min(1).default(30),
    COOKIE_SECURE: z
      .enum(['true', 'false'])
      .default('false')
      .transform((value) => value === 'true'),
    COOKIE_SECRET: z.string().min(16).default('dev-cookie-secret-change-me'),
    CSRF_SECRET: z.string().min(16).default('dev-csrf-secret-change-me'),
    GOOGLE_OAUTH_CLIENT_ID: z.string().optional(),
    GOOGLE_OAUTH_CLIENT_SECRET: z.string().optional(),
    GOOGLE_OAUTH_REDIRECT_URI: z.string().optional(),
    EMAIL_FROM: z.string().default('DreamingCloud <noreply@localhost>'),
    RESEND_API_KEY: z.string().optional(),
    S3_ENDPOINT: z.string().default('http://localhost:9000'),
    S3_REGION: z.string().default('eu-west-1'),
    S3_BUCKET: z.string().default('dreamingcloud-media'),
    S3_ACCESS_KEY_ID: z.string().default('dreamingcloud'),
    S3_SECRET_ACCESS_KEY: z.string().default('dreamingcloud'),
    S3_FORCE_PATH_STYLE: z
      .enum(['true', 'false'])
      .default('true')
      .transform((value) => value === 'true'),
    APP_URL: z.string().default('http://localhost:3000'),
  })
  .superRefine((config, context) => {
    if (config.NODE_ENV !== 'production') {
      return;
    }

    const insecureDefaults = [
      ['JWT_PRIVATE_KEY_PEM', config.JWT_PRIVATE_KEY_PEM, 'dev-insecure-private-key'],
      ['JWT_PUBLIC_KEY_PEM', config.JWT_PUBLIC_KEY_PEM, 'dev-insecure-public-key'],
      ['COOKIE_SECRET', config.COOKIE_SECRET, 'dev-cookie-secret-change-me'],
      ['CSRF_SECRET', config.CSRF_SECRET, 'dev-csrf-secret-change-me'],
      ['S3_ACCESS_KEY_ID', config.S3_ACCESS_KEY_ID, 'dreamingcloud'],
      ['S3_SECRET_ACCESS_KEY', config.S3_SECRET_ACCESS_KEY, 'dreamingcloud'],
    ] as const;

    for (const [name, value, insecure] of insecureDefaults) {
      if (value === insecure || value.includes('REPLACE_ME')) {
        context.addIssue({
          code: 'custom',
          path: [name],
          message: `${name} must be set to a strong production value.`,
        });
      }
    }

    if (!config.COOKIE_SECURE) {
      context.addIssue({
        code: 'custom',
        path: ['COOKIE_SECURE'],
        message: 'COOKIE_SECURE must be true in production.',
      });
    }

    if (
      !config.JWT_PRIVATE_KEY_PEM.includes('BEGIN') ||
      !config.JWT_PUBLIC_KEY_PEM.includes('BEGIN')
    ) {
      context.addIssue({
        code: 'custom',
        path: ['JWT_PRIVATE_KEY_PEM'],
        message: 'Production requires PEM JWT key pair (RS256).',
      });
    }
  });

export type AppConfig = z.infer<typeof environmentSchema>;

export function loadAppConfig(environment: NodeJS.ProcessEnv = process.env): AppConfig {
  return environmentSchema.parse(environment);
}

export function isPemKeyPair(config: AppConfig): boolean {
  const privateKey = config.JWT_PRIVATE_KEY_PEM;
  const publicKey = config.JWT_PUBLIC_KEY_PEM;
  return (
    privateKey.includes('BEGIN') &&
    publicKey.includes('BEGIN') &&
    !privateKey.includes('REPLACE_ME') &&
    !publicKey.includes('REPLACE_ME') &&
    !privateKey.includes('dev-insecure') &&
    !publicKey.includes('dev-insecure')
  );
}
