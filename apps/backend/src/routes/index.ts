import cluster from 'node:cluster';

import { publicProcedure, router } from './trpc';

// Function to simulate CPU load
function stressTest(durationInSeconds: number) {
  const end = Date.now() + durationInSeconds * 1000;

  // Intensive CPU calculations (tight loop)
  while (Date.now() < end) {
    let result = 0;
    for (let i = 0; i < 1e6; i++) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      result += Math.sqrt(i);
    }
  }
  console.log(`CPU stress test finished after ${durationInSeconds} seconds`);
}

export const appRouter = router({
  test: publicProcedure.query(async () => {
    // Start stress test for 30 seconds
    stressTest(120);

    return {
      workerId: cluster.worker?.id,
      instanceId: '',
      instanceIp: '',
      message: 'Deployment test message #14',
    };

    // Fetch EC2 instance id and private ip
    const instanceIdResponse = await fetch(
      'http://169.254.169.254/latest/meta-data/instance-id',
    );
    const instanceIpResponse = await fetch(
      'http://169.254.169.254/latest/meta-data/local-ipv4',
    );

    const instanceId = await instanceIdResponse.text();
    const instanceIp = await instanceIpResponse.text();

    return {
      workerId: cluster.worker?.id,
      instanceId,
      instanceIp,
      message: 'Deployment test message #14',
    };
  }),
});

export type AppRouter = typeof appRouter;
