import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

import { loadEnvFiles } from './load-env.mjs';

loadEnvFiles();

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDirectory = join(__dirname, '../drizzle');
const databaseUrl = process.env.DATABASE_URL;

const mvpTables = [
  'aspirations',
  'auth_sessions',
  'contributions',
  'conversation_participants',
  'messages',
  'outbox_events',
  'users',
];

if (!databaseUrl) {
  console.error('DATABASE_URL is required. Place it in the monorepo root .env (see .env.example).');
  process.exit(1);
}

const files = (await readdir(migrationsDirectory)).filter((name) => name.endsWith('.sql')).sort();

const client = new pg.Client({ connectionString: databaseUrl });

try {
  await client.connect();
} catch (error) {
  console.error(
    `Failed to connect to Postgres at DATABASE_URL. Is the service up?\n${error instanceof Error ? error.message : error}`,
  );
  process.exit(1);
}

try {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  for (const file of files) {
    const alreadyApplied = await client.query('SELECT 1 FROM schema_migrations WHERE id = $1', [
      file,
    ]);

    if (alreadyApplied.rowCount && alreadyApplied.rowCount > 0) {
      console.log(`skip ${file}`);
      continue;
    }

    const sql = await readFile(join(migrationsDirectory, file), 'utf8');
    await client.query('BEGIN');
    try {
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (id) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`applied ${file}`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(
        `Migration failed for ${file}:`,
        error instanceof Error ? error.message : error,
      );
      throw error;
    }
  }

  const result = await client.query(
    `SELECT table_name
     FROM information_schema.tables
     WHERE table_schema = 'public'
       AND table_name = ANY($1::text[])
     ORDER BY table_name`,
    [mvpTables],
  );

  const found = result.rows.map((row) => row.table_name);
  const missing = mvpTables.filter((table) => !found.includes(table));

  if (missing.length > 0) {
    console.error(`MVP tables missing after migrations: ${missing.join(', ')}`);
    process.exit(1);
  }

  console.log(`MVP tables verified: ${found.join(', ')}`);
} finally {
  await client.end();
}
