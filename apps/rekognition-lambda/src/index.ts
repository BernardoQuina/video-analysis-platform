/* eslint-disable no-console */
import {
  RekognitionClient,
  StartLabelDetectionCommand,
  StartLabelDetectionCommandInput,
} from '@aws-sdk/client-rekognition';
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';
import type {
  APIGatewayProxyResult,
  EventBridgeEvent,
  S3ObjectCreatedNotificationEventDetail,
  // eslint-disable-next-line node/no-missing-import
} from 'aws-lambda';

import { waitForRekognitionJob } from './utils/wait-for-job';
import { consolidateLabels } from './utils/consolidate-labels';

const rekognitionClient = new RekognitionClient({
  region: process.env.AWS_REGION,
});
const s3Client = new S3Client({ region: process.env.AWS_REGION });

// Maximum time to wait for rekognition job (14 minutes)
const MAX_WAIT_TIME = 14 * 60 * 1000;
// Time between status checks (10 seconds)
const POLL_INTERVAL = 10 * 1000;

export const handler = async (
  event: EventBridgeEvent<
    'Object Created',
    S3ObjectCreatedNotificationEventDetail
  >,
): Promise<APIGatewayProxyResult> => {
  const { bucket, object } = event.detail;

  const s3MetadataCommand = new HeadObjectCommand({
    Bucket: bucket.name,
    Key: object.key,
  });

  const { Metadata } = await s3Client.send(s3MetadataCommand);

  console.log({ Metadata });

  const params: StartLabelDetectionCommandInput = {
    Video: { S3Object: { Bucket: bucket.name, Name: object.key } },
    MinConfidence: 70,
  };

  try {
    const command = new StartLabelDetectionCommand(params);
    const { JobId } = await rekognitionClient.send(command);

    console.log({ JobId });

    if (!JobId) {
      throw new Error(
        'Something went wrong when starting rekognition job. No JobId.',
      );
    }

    const completedJob = await waitForRekognitionJob({
      rekognitionClient,
      JobId,
      maxWaitTime: MAX_WAIT_TIME,
      pollInterval: POLL_INTERVAL,
    });

    const consolidatedLabels = consolidateLabels(completedJob.Labels ?? []);

    console.dir({ consolidatedLabels }, { depth: Infinity });

    return { statusCode: 200, body: JSON.stringify(completedJob) };
  } catch (error) {
    console.error('Error during rekognition job:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: (error as Error).message }),
    };
  }
};
