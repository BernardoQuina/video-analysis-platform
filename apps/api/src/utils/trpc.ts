import { initTRPC, TRPCError } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';

import { authenticate } from './cognitoAuth';

// Create context for each request
export const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => ({ req, res });

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create();

export const router = t.router;

export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(
  async function isAuthed(opts) {
    const { ctx } = opts;

    const userOrError = await authenticate(ctx);

    if ('code' in userOrError) {
      throw new TRPCError({
        code: userOrError.code,
        message: userOrError.message,
      });
    }

    return opts.next({ ctx: { ...ctx, user: userOrError } });
  },
);
