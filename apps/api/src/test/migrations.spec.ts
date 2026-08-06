import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { applySqlMigrations, startPostgresContainer } from '@dreamingcloud/testing';
import { Client } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDirectory = join(__dirname, '../../drizzle');

// CI validates migrations via `db:migrate:sql` against the Postgres service.
// This suite is reserved for local Testcontainers isolation.
describe.skipIf(Boolean(process.env.CI))('SQL migrations', () => {
  let stop: (() => Promise<void>) | undefined;
  let connectionString = '';
  let setupError: unknown;

  beforeAll(async () => {
    if (process.env.SKIP_TESTCONTAINERS === '1') {
      return;
    }

    try {
      const environment = await startPostgresContainer();
      stop = environment.stop;
      connectionString = environment.connectionString;
      await applySqlMigrations(connectionString, migrationsDirectory);
    } catch (error) {
      setupError = error;
      connectionString = '';
    }
  }, 120_000);

  afterAll(async () => {
    await stop?.();
  });

  it.skipIf(process.env.SKIP_TESTCONTAINERS === '1')('creates core MVP tables', async () => {
    if (!connectionString) {
      const details =
        setupError instanceof Error ? setupError.message : String(setupError ?? 'unknown error');
      throw new Error(
        `Postgres Testcontainers unavailable. Start Docker, or set SKIP_TESTCONTAINERS=1 to skip intentionally. Cause: ${details}`,
      );
    }

    const client = new Client({ connectionString });

    try {
      await client.connect();
    } catch (error) {
      throw new Error(
        `Failed to connect to Testcontainers Postgres: ${error instanceof Error ? error.message : error}`,
      );
    }

    try {
      const result = await client.query<{ table_name: string }>(
        `SELECT table_name
           FROM information_schema.tables
           WHERE table_schema = 'public'
             AND table_name = ANY($1::text[])
           ORDER BY table_name`,
        [
          [
            'users',
            'auth_sessions',
            'aspirations',
            'contributions',
            'messages',
            'conversation_participants',
            'outbox_events',
          ],
        ],
      );

      expect(result.rows.map((row) => row.table_name)).toEqual([
        'aspirations',
        'auth_sessions',
        'contributions',
        'conversation_participants',
        'messages',
        'outbox_events',
        'users',
      ]);
    } finally {
      await client.end();
    }
  });
});
