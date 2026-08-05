import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';

/**
 * Charge le `.env` à la racine du monorepo (ou le `.env` local).
 * Les variables déjà présentes dans process.env ne sont pas écrasées (CI/prod).
 */
export function loadEnvFiles() {
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    resolve(process.cwd(), '.env'),
    resolve(process.cwd(), '../../.env'),
    resolve(here, '../../../.env'),
    resolve(here, '../../.env'),
  ];

  for (const path of candidates) {
    if (existsSync(path)) {
      config({ path, override: false });
      return path;
    }
  }

  return null;
}
