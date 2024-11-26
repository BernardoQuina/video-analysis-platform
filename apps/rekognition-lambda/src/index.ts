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
import { useDB } from '@repo/db';

import { waitForRekognitionJob } from './utils/wait-for-job';
import { consolidateLabels } from './utils/consolidate-labels';

type Metadata = {
  videoid: string;
  userid: string;
};

const rekognitionClient = new RekognitionClient({
  region: process.env.AWS_REGION,
});
const s3Client = new S3Client({ region: process.env.AWS_REGION });

const db = useDB({
  region: process.env.AWS_REGION,
  tableName: process.env.DYNAMODB_TABLE_NAME,
});

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
  // TODO: remove to activate lambda
  // return { statusCode: 200, body: JSON.stringify({ message: 'Test' }) };

  const { bucket, object } = event.detail;

  const objectParams = { Bucket: bucket.name, Key: object.key };

  const { userid, videoid } = (
    await s3Client.send(new HeadObjectCommand(objectParams))
  ).Metadata as Metadata;

  const params: StartLabelDetectionCommandInput = {
    Video: { S3Object: { Bucket: bucket.name, Name: object.key } },
    MinConfidence: 85,
  };

  try {
    // Get info from db
    const { data: videoItem } = await db.entities.videos
      .get({ id: videoid, userId: userid })
      .go();

    if (!videoItem) throw new Error('Video item not found in db.');

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
      JobId: JobId!, // TODO: remove duplicate
      maxWaitTime: MAX_WAIT_TIME,
      pollInterval: POLL_INTERVAL,
    });

    const consolidatedLabels = consolidateLabels(completedJob.Labels ?? []);

    console.dir({ consolidatedLabels }, { depth: Infinity });

    await db.entities.videos
      .update({ id: videoid, userId: userid })
      .set({ rekognitionObjects: consolidatedLabels })
      .go();

    return { statusCode: 200, body: JSON.stringify(completedJob) };
  } catch (error) {
    console.error('Error during rekognition job:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: (error as Error).message }),
    };
  }
};
