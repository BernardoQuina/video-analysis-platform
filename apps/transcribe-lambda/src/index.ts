/* eslint-disable no-console */
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';
import {
  TranscribeClient,
  StartTranscriptionJobCommand,
  StartTranscriptionJobCommandInput,
  GetTranscriptionJobCommand,
  TranscriptionJob,
} from '@aws-sdk/client-transcribe';
import {
  APIGatewayProxyResult,
  EventBridgeEvent,
  S3ObjectCreatedNotificationEventDetail,
  // eslint-disable-next-line node/no-missing-import
} from 'aws-lambda';

const transcribeClient = new TranscribeClient({ region: 'eu-west-1' });
const s3Client = new S3Client({ region: 'eu-west-1' });

// Maximum time to wait for transcription (14 minutes)
const MAX_WAIT_TIME = 14 * 60 * 1000;
// Time between status checks (10 seconds)
const POLL_INTERVAL = 10 * 1000;

async function waitForTranscriptionJob(
  jobName: string,
): Promise<TranscriptionJob> {
  const startTime = Date.now();

  while (Date.now() - startTime < MAX_WAIT_TIME) {
    const command = new GetTranscriptionJobCommand({
      TranscriptionJobName: jobName,
    });

    const response = await transcribeClient.send(command);
    const job = response.TranscriptionJob;

    if (!job) {
      throw new Error('Transcription job not found');
    }

    switch (job.TranscriptionJobStatus) {
      case 'COMPLETED':
        return job;
      case 'FAILED':
        throw new Error(`Transcription job failed: ${job.FailureReason}`);
      case 'IN_PROGRESS':
        // Wait before checking again
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
        continue;
      default:
        throw new Error(`Unknown job status: ${job.TranscriptionJobStatus}`);
    }
  }

  throw new Error('Transcription job timed out');
}

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

  const metadata = await s3Client.send(s3MetadataCommand);

  console.log({ metadata });

  const jobName = `Transcribe-${object.key}`;

  const params: StartTranscriptionJobCommandInput = {
    TranscriptionJobName: jobName,
    LanguageCode: 'en-US',
    MediaFormat: 'mp4',
    Media: { MediaFileUri: `s3://${bucket.name}/${object.key}` },
  };

  console.log({ params });

  try {
    const command = new StartTranscriptionJobCommand(params);
    await transcribeClient.send(command);

    const completedJob = await waitForTranscriptionJob(jobName);

    return { statusCode: 200, body: JSON.stringify(completedJob) };
  } catch (error) {
    console.error('Error starting transcription job:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: (error as Error).message }),
    };
  }
};
