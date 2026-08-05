import { readdir, readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const modulesRoot = join(process.cwd(), 'apps/api/src/modules');
const forbiddenDomainImports = /from\s+['"](?:@nestjs\/|drizzle-orm|zod|bullmq|pg|pino|@fastify\/)/;
const importPattern = /from\s+['"]([^'"]+)['"]/g;

async function getTypeScriptFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return getTypeScriptFiles(path);
      return entry.isFile() && path.endsWith('.ts') ? [path] : [];
    }),
  );

  return nested.flat();
}

async function main() {
  let files = [];
  try {
    files = await getTypeScriptFiles(modulesRoot);
  } catch {
    return;
  }

  const violations = [];
  for (const file of files) {
    const content = await readFile(file, 'utf8');
    const parts = relative(modulesRoot, file).split(sep);
    const [moduleName, layer] = parts;

    if (layer === 'domain' && forbiddenDomainImports.test(content)) {
      violations.push(`${relative(process.cwd(), file)}: domain imports a framework dependency`);
    }

    for (const match of content.matchAll(importPattern)) {
      const specifier = match[1];
      if (!specifier?.includes('/modules/')) continue;

      const target = specifier.split('/modules/')[1];
      const targetModule = target?.split('/')[0];
      if (
        targetModule &&
        targetModule !== moduleName &&
        !specifier.endsWith(`${targetModule}.public`) &&
        !specifier.endsWith(`${targetModule}.public.ts`)
      ) {
        violations.push(
          `${relative(process.cwd(), file)}: imports internal code from module ${targetModule}`,
        );
      }
    }
  }

  if (violations.length > 0) {
    console.error(violations.join('\n'));
    process.exitCode = 1;
  }
}

await main();
