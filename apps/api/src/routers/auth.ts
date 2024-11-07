import { z } from 'zod';

import { publicProcedure, router } from '../utils/trpc';
import {
  authenticate,
  exchangeCodeForTokens,
  revokeTokens,
  setTokens,
} from '../utils/cognitoAuth';

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
});
