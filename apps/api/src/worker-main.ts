import { bootstrapWorker } from './worker-bootstrap';

void bootstrapWorker().catch((error: unknown) => {
  console.error('DreamingCloud worker failed to start.', error);
  process.exitCode = 1;
});
