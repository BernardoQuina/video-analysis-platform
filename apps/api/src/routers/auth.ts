import { createHash } from 'node:crypto';

import { z } from 'zod';
import { TRPCError } from '@trpc/server';

import { protectedProcedure, publicProcedure, router } from '../utils/trpc';
import {
  authenticate,
  CognitoUser,
  exchangeCodeForTokens,
  revokeTokens,
  setToken,
  validateToken,
} from '../utils/cognitoAuth';
import { db } from '../utils/db';
import { getTimestampDaysFromNow } from '../utils/miscellaneous';

export const auth = router({
  exchangeCodeForToken: publicProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const tokens = await exchangeCodeForTokens(input.code);

      const user = (await validateToken(tokens.id_token)) as CognitoUser;

      // Get refresh token from db
      // Hash of id token used bc the token itself is too large for DynamoDB sk
      const idTokenHash = createHash('sha256')
        .update(tokens.id_token)
        .digest('hex');

      await db.entities.sessions
        .create({
          id: idTokenHash,
          refreshToken: tokens.refresh_token,
          userId: user.sub,
          expiresAt: getTimestampDaysFromNow(365), // Refresh token expiration
        })
        .go();

      setToken({ res: ctx.res, idToken: tokens.id_token });

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

      return userCollections;
    } catch (error) {
      console.error('Error in user collections: ', error);

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: (error as Error).message,
      });
    }
  }),
});
