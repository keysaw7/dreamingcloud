import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const root = join(process.cwd(), 'apps/web/src');
const targets = ['components', 'features'];
const extensions = new Set(['.ts', '.tsx']);
const violations = [];

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return filesIn(path);
      return extensions.has(path.slice(path.lastIndexOf('.'))) ? [path] : [];
    }),
  );
  return files.flat();
}

function report(path, message) {
  violations.push(`${relative(process.cwd(), path)}: ${message}`);
}

for (const target of targets) {
  for (const path of await filesIn(join(root, target))) {
    const source = await readFile(path, 'utf8');
    const legacy = source.includes('@dreamingcloud/ui');
    const lines = source.split('\n').length;

    if (!legacy && lines > 200) report(path, `composant trop long (${lines} lignes, maximum 200)`);
    if (!legacy && /(?:bg|text|border|ring)-\[(?:#|var\(--)/.test(source)) {
      report(path, 'couleur non sémantique');
    }
    if (!legacy && /style=\{\{/.test(source)) report(path, 'style inline interdit');
    if (!legacy && /<Link\b[^>]*>(?:(?!<\/Link>)[\s\S]){0,400}<Button\b/.test(source)) {
      report(path, 'un bouton ne peut pas être enfant d’un lien');
    }
  }
}

if (violations.length > 0) {
  console.error(violations.join('\n'));
  process.exitCode = 1;
}
