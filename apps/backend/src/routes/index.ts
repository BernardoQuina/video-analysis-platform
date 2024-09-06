import { publicProcedure, router } from './trpc';

export const appRouter = router({
  test: publicProcedure.query(() => {
    return { code: 100, message: 'test route' };
  }),
});

export type AppRouter = typeof appRouter;
