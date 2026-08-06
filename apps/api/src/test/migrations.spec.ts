import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { applySqlMigrations, startPostgresContainer } from '@dreamingcloud/testing';
import { Client } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDirectory = join(__dirname, '../../drizzle');

describe('SQL migrations', () => {
  let stop: (() => Promise<void>) | undefined;
  let connectionString = '';

  beforeAll(async () => {
    // CI already provides a migrated Postgres service via DATABASE_URL.
    if (process.env.CI && process.env.DATABASE_URL) {
      connectionString = process.env.DATABASE_URL;
      return;
    }

    if (!process.env.CI && process.env.SKIP_TESTCONTAINERS === '1') {
      return;
    }

    try {
      const environment = await startPostgresContainer();
      stop = environment.stop;
      connectionString = environment.connectionString;
      await applySqlMigrations(connectionString, migrationsDirectory);
    } catch (error) {
      if (process.env.CI) {
        throw error;
      }
      // Local environments without Docker/testcontainers skip the suite.
      connectionString = '';
    }
  }, 120_000);

  afterAll(async () => {
    await stop?.();
  });

  it('creates core MVP tables', async () => {
    if (!connectionString) {
      return;
    }

    const client = new Client({ connectionString });
    await client.connect();

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
