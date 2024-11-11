import { router } from '../utils/trpc';

import { auth } from './auth';
import { videos } from './videos';

export const appRouter = router({
  auth,
  videos,
});

export type AppRouter = typeof appRouter;
