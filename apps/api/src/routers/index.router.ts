import { router } from '../utils/trpc';

import { auth } from './auth.router';
import { videos } from './videos.router';

export const appRouter = router({ auth, videos });

export type AppRouter = typeof appRouter;
