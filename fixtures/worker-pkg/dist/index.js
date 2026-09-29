import { Worker } from 'node:worker_threads';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// The worker file name is only known at runtime, like a user-configurable worker path.
export function startWorker(name = 'worker.cjs') {
  const workerPath = join(dirname(fileURLToPath(import.meta.url)), name);
  return new Worker(workerPath);
}
