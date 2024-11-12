/* eslint-disable no-console */
import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';

import {
  S3Client,
  GetObjectCommand,
  // PutObjectCommand,
} from '@aws-sdk/client-s3';
import type {
  APIGatewayProxyResult,
  EventBridgeEvent,
  S3ObjectCreatedNotificationEventDetail,
  // eslint-disable-next-line node/no-missing-import
} from 'aws-lambda';
import ffmpeg from 'fluent-ffmpeg';

const s3Client = new S3Client({ region: process.env.AWS_REGION });

export const handler = async (
  event: EventBridgeEvent<
    'Object Created',
    S3ObjectCreatedNotificationEventDetail
  >,
): Promise<APIGatewayProxyResult> => {
  const { bucket, object } = event.detail;
  const bucketName = bucket.name;
  const objectKey = object.key;
  const thumbnailKey = `thumbnails/${objectKey.replace(/\.[^/.]+$/, '.jpg')}`;
  const tempVideoPath = path.join('/tmp', 'temp-video.mp4');
  const tempThumbnailPath = path.join('/tmp', 'thumbnail.jpg');

  try {
    // Step 1: Retrieve the video file from S3
    const getObjectParams = {
      Bucket: bucketName,
      Key: objectKey,
    };
    const response = await s3Client.send(new GetObjectCommand(getObjectParams));

    if (!response.Body) {
      throw new Error('No video stream available');
    }

    // Write the S3 object to a temporary file
    const writeStream = fs.createWriteStream(tempVideoPath);
    await new Promise((resolve, reject) => {
      (response.Body as Readable)
        .pipe(writeStream)
        .on('error', reject)
        .on('finish', resolve);
    });

    // Verify the file exists and has content
    if (
      !fs.existsSync(tempVideoPath) ||
      fs.statSync(tempVideoPath).size === 0
    ) {
      throw new Error('Video file not written correctly');
    }

    // Step 2: Extract the first frame using ffmpeg
    await new Promise((resolve, reject) => {
      ffmpeg(tempVideoPath) // Direct path input instead of chaining input()
        .on('start', (commandLine) => {
          console.log('FFmpeg process started:', commandLine);
        })
        .on('end', () => {
          console.log('FFmpeg process completed');
          resolve(null);
        })
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
          reject(err);
        })
        .screenshot({
          count: 1,
          timestamps: ['1'],
          filename: path.basename(tempThumbnailPath),
          folder: path.dirname(tempThumbnailPath),
          size: '320x240',
        });
    });

    // Step 3: Upload the thumbnail to S3
    // Verify thumbnail was created
    if (!fs.existsSync(tempThumbnailPath)) {
      throw new Error('Thumbnail was not created');
    }

    // const fileContent = fs.readFileSync(tempThumbnailPath);
    // const putObjectParams = {
    //   Bucket: bucketName,
    //   Key: thumbnailKey,
    //   Body: fileContent,
    //   ContentType: 'image/jpeg',
    // };

    // await s3Client.send(new PutObjectCommand(putObjectParams));

    // console.log(
    //   `Successfully created and uploaded thumbnail for ${objectKey} at ${thumbnailKey}`,
    // );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Created video thumbnail',
        thumbnailKey,
      }),
    };
  } catch (error) {
    console.error('Error creating video thumbnail:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: (error as Error).message }),
    };
  } finally {
    // Clean up the temporary files
    for (const tempFile of [tempThumbnailPath, tempVideoPath]) {
      if (fs.existsSync(tempFile)) {
        try {
          fs.unlinkSync(tempFile);
        } catch (error) {
          console.error(`Error cleaning up temporary file ${tempFile}:`, error);
        }
      }
    }
  }
};
