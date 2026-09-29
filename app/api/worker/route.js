import { startWorker } from 'worker-pkg';

export const dynamic = 'force-dynamic';

export async function GET() {
  const worker = startWorker();
  const message = await new Promise((resolve) => worker.once('message', resolve));
  await worker.terminate();
  return Response.json({ message });
}
