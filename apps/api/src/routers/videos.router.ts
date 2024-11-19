import { randomUUID } from 'node:crypto';
import path from 'node:path';

import { TRPCError } from '@trpc/server';
import {
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  S3Client,
  UploadPartCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { protectedProcedure, publicProcedure, router } from '../utils/trpc';
import { db } from '../utils/db';
import {
  completeUploadSchema,
  getUploadUrlSchema,
  initiateUploadSchema,
  singleVideoSchema,
} from '../schemas/videos.schema';
import { authenticate } from '../utils/cognito-auth';

const s3Client = new S3Client({ region: process.env.AWS_REGION });
const bucketName = process.env.VIDEO_STORAGE_S3_BUCKET_NAME;

export const videos = router({
  // Get videos that are pubic (including from other users)
  publicVideos: publicProcedure.query(async () => {
    try {
      const { data: publicVideos } = await db.entities.videos.query
        .publicVideos({ visibility: 'PUBLIC' })
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

  // Get user specific videos (private or public)
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

  // Get single video by id
  singleVideo: publicProcedure
    .input(singleVideoSchema)
    .query(async ({ ctx, input }) => {
      try {
        const {
          data: [video],
        } = await db.entities.videos.query.byVideo({ id: input.videoId }).go();

        if (!video) throw new Error('404');

        if (video.visibility === 'PUBLIC') return video;

        const userOrError = await authenticate(ctx);

        // No signed in user and this video is private so we'll return 404
        if ('code' in userOrError) throw new Error('404');

        // User is signed in but its not their video
        if (userOrError.sub !== video.userId) throw new Error('404');

        return video;
      } catch (err) {
        const error = err as Error;

        console.error('Error retrieving video: ', error.message);

        if (error.message == '404') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'No video with that id was found',
          });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }
    }),

  // Initialize multipart upload
  initiateUpload: protectedProcedure
    .input(initiateUploadSchema)
    .mutation(async ({ ctx, input }) => {
      const videoId = randomUUID() as string;

      const baseName = path.basename(input.fileName);

      const s3Key = `videos/${ctx.user.sub}/${videoId}-${input.fileName}`;
      const thumbnailS3Key = `thumbnails/${ctx.user.sub}/${videoId}-${baseName}.jpg`;

      try {
        // Create video item in db
        await db.entities.videos
          .create({
            id: videoId,
            userId: ctx.user.sub,
            s3Key,
            thumbnailS3Key,
            fileName: input.fileName,
            aspectRatio: input.aspectRatio,
            visibility: input.visibility,
            prompt: input.prompt,
            userName: `${ctx.user.given_name} ${ctx.user.family_name}`,
            userPicture: ctx.user.picture,
          })
          .go();
      } catch (error) {
        console.error('Error creating video item in db: ', error);

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to initiate upload.',
        });
      }

      try {
        const command = new CreateMultipartUploadCommand({
          Bucket: bucketName,
          Key: s3Key,
          ContentType: input.fileType,
          Metadata: { videoId, userId: ctx.user.sub }, // to retrieve items from lambda
        });

        const { UploadId } = await s3Client.send(command);

        if (!UploadId) throw new Error('No upload id.');

        return { uploadId: UploadId, s3Key, videoId };
      } catch (error) {
        console.error(
          'Error creating/sending multipart upload command: ',
          error,
        );

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to initiate upload.',
        });
      }
    }),

  // Get signed url for part upload
  getUploadUrl: protectedProcedure
    .input(getUploadUrlSchema)
    .mutation(async ({ input }) => {
      try {
        const command = new UploadPartCommand({
          Bucket: bucketName,
          Key: input.s3Key,
          UploadId: input.uploadId,
          PartNumber: input.partNumber,
        });

        const signedUrl = await getSignedUrl(s3Client, command, {
          expiresIn: 3600,
        });

        return { signedUrl };
      } catch (error) {
        console.error('Error generating signed url: ', error);

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate signed url.',
        });
      }
    }),

  // Complete multipart upload
  completeUpload: protectedProcedure
    .input(completeUploadSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const command = new CompleteMultipartUploadCommand({
          Bucket: bucketName,
          Key: input.s3Key,
          UploadId: input.uploadId,
          MultipartUpload: { Parts: input.parts },
        });

        await s3Client.send(command);

        // Update db
        await db.entities.videos
          .update({ id: input.videoId, userId: ctx.user.sub })
          .set({ uploadComplete: true })
          .go();

        return { message: 'Upload completed successfully.' };
      } catch (error) {
        console.error('Error completing multipart upload: ', error);

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to complete upload.',
        });
      }
    }),
});
