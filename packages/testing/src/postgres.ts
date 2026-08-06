import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { GenericContainer, type StartedTestContainer, Wait } from 'testcontainers';
import { Client } from 'pg';

export interface PostgresTestEnvironment {
  readonly container: StartedTestContainer;
  readonly connectionString: string;
  stop(): Promise<void>;
}

export async function startPostgresContainer(): Promise<PostgresTestEnvironment> {
  const container = await new GenericContainer('postgres:17-alpine')
    .withEnvironment({
      POSTGRES_USER: 'dreamingcloud',
      POSTGRES_PASSWORD: 'dreamingcloud',
      POSTGRES_DB: 'dreamingcloud',
    })
    .withExposedPorts(5432)
    .withWaitStrategy(Wait.forLogMessage('database system is ready to accept connections', 2))
    .start();

  const host = container.getHost();
  const port = container.getMappedPort(5432);
  const connectionString = `postgres://dreamingcloud:dreamingcloud@${host}:${port}/dreamingcloud`;

  return {
    container,
    connectionString,
    stop: async () => {
      await container.stop();
    },
  };
}

export async function applySqlMigrations(
  connectionString: string,
  migrationsDirectory: string,
): Promise<void> {
  const files = (await readdir(migrationsDirectory)).filter((name) => name.endsWith('.sql')).sort();

  const client = new Client({ connectionString });
  await client.connect();

  try {
    for (const file of files) {
      const sql = await readFile(join(migrationsDirectory, file), 'utf8');
      await client.query(sql);
    }
  } finally {
    await client.end();
  }
}
