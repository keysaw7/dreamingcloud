import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config } from 'dotenv';

/**
 * Charge le `.env` à la racine du monorepo (ou le `.env` local).
 * Les variables déjà présentes dans process.env ne sont pas écrasées (CI/prod).
 */
export function loadEnvFiles(): string | null {
  const candidates = [
    resolve(process.cwd(), '.env'),
    resolve(process.cwd(), '../.env'),
    resolve(process.cwd(), '../../.env'),
  ];

  for (const path of candidates) {
    if (existsSync(path)) {
      config({ path, override: false });
      return path;
    }
  }

  return null;
}
