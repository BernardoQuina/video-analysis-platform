/* eslint-disable no-console */
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';
import {
  TranscribeClient,
  StartTranscriptionJobCommand,
  StartTranscriptionJobCommandInput,
} from '@aws-sdk/client-transcribe';
import {
  APIGatewayProxyResult,
  EventBridgeEvent,
  S3ObjectCreatedNotificationEventDetail,
  // eslint-disable-next-line node/no-missing-import
} from 'aws-lambda';

const transcribeClient = new TranscribeClient({ region: 'eu-west-1' });
const s3Client = new S3Client({ region: 'eu-west-1' });

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

    const data = await transcribeClient.send(command);

    console.log({ data });

    return { statusCode: 200, body: JSON.stringify(data) };
  } catch (error) {
    console.error('Error starting transcription job:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: (error as Error).message }),
    };
  }
};
