import { randomUUID } from 'node:crypto';
import path from 'node:path';

import { TRPCError } from '@trpc/server';
import z from 'zod';
import {
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  S3Client,
  UploadPartCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { protectedProcedure, publicProcedure, router } from '../utils/trpc';
import { db } from '../utils/db';

const s3Client = new S3Client({ region: process.env.AWS_REGION });
const bucketName = process.env.VIDEO_STORAGE_S3_BUCKET_NAME;

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

  // Initialize multipart upload
  initiateUpload: protectedProcedure
    .input(
      z
        .object({
          fileName: z
            .string({ message: 'File name must be provided.' })
            .min(1, { message: 'Filename cannot be empty.' })
            .regex(/^[a-zA-Z0-9._-]+$/, {
              message:
                'Filename contains invalid characters. Allowed characters are letters, numbers, dashes (-), underscores (_), and periods (.).',
            })
            .refine((fileName) => !fileName.includes('/'), {
              message: 'Filename cannot contain forward slashes (/).',
            }),
          fileType: z.literal('mp4', {
            message:
              'File type must be provided and only mp4 is accepted at the moment.',
          }),
          fileSize: z.number({ message: 'File size must be provided.' }),
          visibility: z.enum(['PUBLIC', 'PRIVATE'], {
            message: 'Video visibility must be set either to public or private',
          }),
        })
        .strict({
          message: 'Only file name, file type and file size are allowed.',
        }),
    )
    .mutation(async ({ ctx, input }) => {
      const videoId = randomUUID() as string;

      const baseName = path.basename(input.fileName);

      const s3Key = `/videos/${ctx.user.sub}/${videoId}-${input.fileName}`;
      const thumbnailS3Key = `/thumbnails/${ctx.user.sub}/${videoId}-${baseName}.jpg`;

      try {
        // Create video item in db
        await db.entities.videos
          .create({
            id: videoId,
            userId: ctx.user.sub,
            s3Key,
            thumbnailS3Key,
            visibility: input.visibility,
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
        });

        const { UploadId } = await s3Client.send(command);

        return { uploadId: UploadId };
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
    .input(
      z
        .object({
          uploadId: z.string({ message: 'Upload id must be provided.' }),
          s3Key: z.string({ message: 'S3 key must be provided.' }),
          partNumber: z.number({ message: 'File size must be provided.' }),
        })
        .strict({
          message: 'Only upload id, s3 key and part number are allowed.',
        }),
    )
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
    .input(
      z
        .object({
          videoId: z.string({ message: 'Video id must be provided' }),
          uploadId: z.string({ message: 'Upload id must be provided.' }),
          s3Key: z.string({ message: 'S3 key must be provided.' }),
          parts: z.array(
            z.object({
              PartNumber: z.number().int().positive({
                message: 'PartNumber must be a positive integer.',
              }),
              ETag: z
                .string()
                .min(1, { message: 'ETag cannot be empty' })
                .regex(/^"[^"]+"$/, {
                  message: 'ETag must be a quoted string as returned by S3.',
                }),
            }),
          ),
        })
        .strict({
          message: 'Only upload id, s3 key and part number are allowed.',
        }),
    )
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
