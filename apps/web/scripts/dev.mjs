import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot = join(__dirname, '..');
const lockCandidates = [
  join(webRoot, '.next', 'dev', 'lock'),
  join(webRoot, '.next', 'dev', 'logs', 'next-development.log'),
];

function findExistingNextPid() {
  // Next 16 writes a lock file with the owning PID when available.
  const lockPath = join(webRoot, '.next', 'dev', 'lock');
  if (!existsSync(lockPath)) {
    return null;
  }

  try {
    const raw = readFileSync(lockPath, 'utf8').trim();
    const asJson = (() => {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    })();

    const pid = Number(asJson?.pid ?? raw);
    if (!Number.isInteger(pid) || pid <= 0) {
      return null;
    }

    try {
      process.kill(pid, 0);
      return pid;
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}

const existingPid = findExistingNextPid();
if (existingPid) {
  console.error(
    [
      `Another Next.js dev server is already running for apps/web (PID ${existingPid}).`,
      'Stop it before starting a new one:',
      `  kill ${existingPid}`,
      'Then re-run: pnpm --filter @dreamingcloud/web dev',
      `Lock/log hints: ${lockCandidates.filter((path) => existsSync(path)).join(', ') || 'none'}`,
    ].join('\n'),
  );
  process.exit(1);
}

const child = spawn('next', ['dev'], {
  cwd: webRoot,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
