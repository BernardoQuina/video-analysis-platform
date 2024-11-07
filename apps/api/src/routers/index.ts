import cluster from 'node:cluster';

import { publicProcedure, router } from '../utils/trpc';

import { auth } from './auth';

export const appRouter = router({
  auth,
  test: publicProcedure.query(async () => {
    try {
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
        message: 'Deployment test message',
      };
    } catch (error) {
      console.error(error);

      if (process.env.NODE_ENV === 'development') {
        return {
          workerId: cluster.worker?.id,
          instanceId: 'none (local environment)',
          instanceIp: 'none (local environment)',
          message: 'Cannot return instance info on local environment',
        };
      }
    }
  }),
});

export type AppRouter = typeof appRouter;
