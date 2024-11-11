import { TRPCError } from '@trpc/server';

import { protectedProcedure, publicProcedure, router } from '../utils/trpc';
import { db } from '../utils/db';

export const videos = router({
  publicVideos: publicProcedure.query(async () => {
    try {
      const { data: publicVideos } = await db.entities.videos.query
        .publicVideos({
          visibility: 'PUBLIC',
        })
        .go();

      return publicVideos;
    } catch (error) {
      console.error('Error retrieving public videos: ', error);

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: (error as Error).message,
      });
    }
  }),

  myVideos: protectedProcedure.query(async ({ ctx }) => {
    try {
      const { data: myVideos } = await db.entities.videos.query
        .byUser({ userId: ctx.user.sub })
        .go();

      return myVideos;
    } catch (error) {
      console.error('Error retrieving private videos: ', error);

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: (error as Error).message,
      });
    }
  }),
});
