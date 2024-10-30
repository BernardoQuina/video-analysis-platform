/* eslint-disable no-console */
// import { S3Client } from '@aws-sdk/client-s3';
// import {
//   TranscribeClient,
//   StartTranscriptionJobCommand,
//   // StartTranscriptionJobCommandInput,
// } from '@aws-sdk/client-transcribe';
import {
  APIGatewayProxyResult,
  EventBridgeEvent,
  S3ObjectCreatedNotificationEventDetail,
  // eslint-disable-next-line node/no-missing-import
} from 'aws-lambda';

// const s3Client = new S3Client({});
// const transcribeClient = new TranscribeClient({});

export const handler = async (
  event: EventBridgeEvent<
    'Object Created',
    S3ObjectCreatedNotificationEventDetail
  >,
): Promise<APIGatewayProxyResult> => {
  console.dir(event, { depth: null, colors: true });

  // const record: SQSRecord = event.Records[0];
  // const message = JSON.parse(record.body);

  // console.log({ message });

  // const s3Bucket = message.Records[0].s3.bucket.name;
  // const s3Key = message.Records[0].s3.object.key;
  // const jobName = `Transcribe-${s3Key}`;

  // const params: StartTranscriptionJobCommandInput = {
  //   TranscriptionJobName: jobName,
  //   LanguageCode: 'en-US',
  //   MediaFormat: 'mp4',
  //   Media: { MediaFileUri: `s3://${s3Bucket}/${s3Key}` },
  //   OutputBucketName: s3Bucket,
  // };

  // console.log({ params });

  return { statusCode: 400, body: JSON.stringify({ error: 'Test request' }) };

  // try {
  //   const command = new StartTranscriptionJobCommand(params);
  //   const result = await transcribeClient.send(command);
  //   console.log({ result });
  //   return { statusCode: 200, body: JSON.stringify(result) };
  // } catch (error) {
  //   console.error('Error starting transcription job:', error);
  //   return {
  //     statusCode: 500,
  //     body: JSON.stringify({ error: (error as Error).message }),
  //   };
  // }
};
