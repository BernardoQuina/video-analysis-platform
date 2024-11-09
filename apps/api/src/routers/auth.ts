import { z } from 'zod';
import { TRPCError } from '@trpc/server';

import { protectedProcedure, publicProcedure, router } from '../utils/trpc';
import {
  authenticate,
  exchangeCodeForTokens,
  revokeTokens,
  setTokens,
} from '../utils/cognitoAuth';
import { db } from '../utils/db';

export const auth = router({
  exchangeCodeForToken: publicProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const tokens = await exchangeCodeForTokens(input.code);

      setTokens({ res: ctx.res, tokens });

      return { message: 'Authenticated' };
    }),

  me: publicProcedure.query(async ({ ctx }) => {
    const userOrError = await authenticate(ctx);

    if ('code' in userOrError) return null; // we want to return null when no user is logged in

    return {
      id: userOrError.sub,
      givenName: userOrError.given_name,
      familyName: userOrError.family_name,
      picture: userOrError.picture,
    };
  }),

  signOut: publicProcedure.mutation(async ({ ctx }) => {
    const signOutMessage = await revokeTokens(ctx);

    return signOutMessage;
  }),

  userCollections: protectedProcedure.query(async ({ ctx }) => {
    try {
      const { data: userCollections } = await db.collections
        .user({ userId: ctx.user.sub })
        .go();

      console.log({ userCollections });

      return userCollections;
    } catch (error) {
      console.log('error in user collections: ', error);

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: (error as Error).message,
      });
    }
  }),
});
