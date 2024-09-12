import cluster from 'node:cluster';

import { publicProcedure, router } from './trpc';

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

    return { workerId: cluster.worker?.id, instanceId, instanceIp };
  }),
});

export type AppRouter = typeof appRouter;
