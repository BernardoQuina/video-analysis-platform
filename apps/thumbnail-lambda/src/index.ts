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
  const thumbnailKey = `thumbnails/${objectKey.replace(/\.[^/.]+$/, '.jpg')}`; // Output path
  const tempVideoPath = path.join('/tmp', 'temp-video.mp4');
  const tempThumbnailPath = path.join('/tmp', 'thumbnail.png');

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
    // Write the S3 object to a temporary file in Lambda’s /tmp directory
    const writeStream = fs.createWriteStream(tempVideoPath);
    await new Promise((resolve, reject) => {
      (response.Body as Readable)
        .pipe(writeStream)
        .on('error', reject)
        .on('finish', resolve);
    });

    // Step 2: Extract the first frame using ffmpeg
    await new Promise((resolve, reject) => {
      ffmpeg()
        .inputFormat('mp4')
        .input(tempVideoPath)
        .inputOptions(['-y']) // Overwrite output files without asking
        .screenshots({
          count: 1, // Capture only one frame
          timemarks: ['1'], // Capture frame at 1 second
          filename: path.basename(tempThumbnailPath), // Output file name
          folder: path.dirname(tempThumbnailPath), // temporary folder
        })
        // .outputOptions([
        //   '-frames:v 1', // Extract 1 frame only
        //   '-f image2', // Force format
        //   '-vf scale=320:240', // Scale the output
        // ])
        .on('start', (commandLine) => {
          console.log('FFmpeg process started:', commandLine);
        })
        .on('end', async () => {
          console.log('FFmpeg process completed');
          resolve(null);
        })
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
          reject(err);
        });
      // .save(thumbnailPath);
    });

    // Step 3: Upload the thumbnail to S3
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
    if (fs.existsSync(tempThumbnailPath)) {
      try {
        fs.unlinkSync(tempThumbnailPath);
      } catch (error) {
        console.error('Error cleaning up temporary file:', error);
      }
    }

    if (fs.existsSync(tempVideoPath)) {
      try {
        fs.unlinkSync(tempVideoPath);
      } catch (error) {
        console.error('Error cleaning up temporary file:', error);
      }
    }
  }
};
