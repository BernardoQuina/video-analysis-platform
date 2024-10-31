/* eslint-disable no-console */
import {
  RekognitionClient,
  DetectLabelsCommand,
  DetectLabelsCommandInput,
} from '@aws-sdk/client-rekognition';
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';
import type {
  APIGatewayProxyResult,
  EventBridgeEvent,
  S3ObjectCreatedNotificationEventDetail,
  // eslint-disable-next-line node/no-missing-import
} from 'aws-lambda';

// import { waitForRekognitionJob } from './utils/waitForJob';
// import { getRekognitionResults } from './utils/getJobResults';

const rekognitionClient = new RekognitionClient({ region: 'eu-west-1' });
const s3Client = new S3Client({ region: 'eu-west-1' });

// Maximum time to wait for transcription (14 minutes)
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

  const params: DetectLabelsCommandInput = {
    Image: { S3Object: { Bucket: bucket.name, Name: object.key } },
    MaxLabels: 10,
    MinConfidence: 70,
  };

  try {
    const command = new DetectLabelsCommand(params);
    const results = await rekognitionClient.send(command);

    console.dir({ results }, { depth: Infinity });

    // const completedJob = await waitForRekognitionJob({
    //   rekognitionClient,
    //   jobName,
    //   maxWaitTime: MAX_WAIT_TIME,
    //   pollInterval: POLL_INTERVAL,
    // });

    // if (!completedJob.Transcript?.TranscriptFileUri) {
    //   throw new Error('No transcript file URI in completed job');
    // }

    // const { results } = await getRekognitionResults(
    //   completedJob.Transcript.TranscriptFileUri,
    // );

    return { statusCode: 200, body: JSON.stringify(results) };
  } catch (error) {
    console.error('Error during rekognition job:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: (error as Error).message }),
    };
  }
};
