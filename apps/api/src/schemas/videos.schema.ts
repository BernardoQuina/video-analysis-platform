import z from 'zod';

export const initiateUploadSchema = z
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
    fileType: z.string().refine((value) => value === 'video/mp4', {
      message: 'Only mp4 files are accepted at the moment.',
    }),
    fileSize: z
      .number({ message: 'File size must be provided.' })
      .max(1024 * 1024 * 200, { message: 'File exceeds 200MB.' }),
    visibility: z.enum(['PUBLIC', 'PRIVATE'], {
      message: 'Video visibility must be set either to public or private.',
    }),
    prompt: z
      .string({ message: 'An analysis prompt must be provided.' })
      .min(3, { message: 'Analysis prompt must be at least 3 characters.' }),
  })
  .strict({
    message:
      'Only file name, file type, file size, visibility and prompt are allowed.',
  });

export const getUploadUrlSchema = z
  .object({
    uploadId: z.string({ message: 'Upload id must be provided.' }),
    s3Key: z.string({ message: 'S3 key must be provided.' }),
    partNumber: z.number({ message: 'File size must be provided.' }),
  })
  .strict({
    message: 'Only upload id, s3 key and part number are allowed.',
  });

export const completeUploadSchema = z
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
          .min(1, { message: 'ETag cannot be empty.' })
          .regex(/^"[^"]+"$/, {
            message: 'ETag must be a quoted string as returned by S3.',
          }),
      }),
      { message: 'Upload parts must be provided.' },
    ),
  })
  .strict({
    message: 'Only upload id, s3 key and part number are allowed.',
  });
