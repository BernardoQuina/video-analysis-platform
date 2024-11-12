/* eslint-disable no-console */
import os from 'node:os';
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
  // const thumbnailKey = `thumbnails/${objectKey.replace(/\.[^/.]+$/, '.jpg')}`; // Output path
  const thumbnailFileName = 'screenshot.png';
  const thumbnailPath = path.join(os.tmpdir(), thumbnailFileName); // Use temporary directory to save the thumbnail

  try {
    // Step 1: Retrieve the video file from S3
    const getObjectParams = {
      Bucket: bucketName,
      Key: objectKey,
    };
    const response = await s3Client.send(new GetObjectCommand(getObjectParams));
    const stream = response.Body as Readable;

    if (!stream) throw new Error('No video stream.');

    // Step 2: Extract the first frame and resize it
    await new Promise((resolve, reject) => {
      ffmpeg(stream)
        .on('end', resolve)
        .on('error', reject)
        .screenshots({
          timestamps: ['5'], // take a screenshot at 5 seconds
          filename: thumbnailFileName, // temporary file name
          folder: os.tmpdir(), // temporary folder
          size: '320x240', // output dimensions
        });
    });

    // Step 3: Upload the thumbnail to S3 with the /thumbnails prefix
    // Read the screenshot from the file system
    // const fileContent = fs.readFileSync(thumbnailPath);

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
      body: JSON.stringify({ message: 'Created video thumbnail' }),
    };
  } catch (error) {
    console.error('Error creating video thumbnail:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: (error as Error).message }),
    };
  } finally {
    // Clean up the temporary file
    if (fs.existsSync(thumbnailPath)) {
      fs.unlinkSync(thumbnailPath);
    }
  }
};
