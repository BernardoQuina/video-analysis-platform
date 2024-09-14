import cluster from 'node:cluster';

import { publicProcedure, router } from './trpc';

// Function to simulate CPU load (without blocking)
function _stressTest(durationInSeconds: number) {
  const end = Date.now() + durationInSeconds * 1000;

  function performStress() {
    if (Date.now() >= end) {
      // eslint-disable-next-line no-console
      console.log(
        `CPU stress test finished after ${durationInSeconds} seconds`,
      );
      return;
    }

    // Perform intensive calculation
    let result = 0;
    for (let i = 0; i < 1e6; i++) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      result += Math.sqrt(i);
    }

    // Use setImmediate to schedule the next batch of calculations
    setImmediate(performStress);
  }

  // Start the stress test
  performStress();
}

export const appRouter = router({
  test: publicProcedure.query(async () => {
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
      message: 'Deployment test message #19',
    };
  }),
});

export type AppRouter = typeof appRouter;
