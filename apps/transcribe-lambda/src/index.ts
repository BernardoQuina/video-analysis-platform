/* eslint-disable no-console */
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';
import {
  TranscribeClient,
  StartTranscriptionJobCommand,
  StartTranscriptionJobCommandInput,
} from '@aws-sdk/client-transcribe';
import type {
  APIGatewayProxyResult,
  EventBridgeEvent,
  S3ObjectCreatedNotificationEventDetail,
  // eslint-disable-next-line node/no-missing-import
} from 'aws-lambda';

import { waitForTranscriptionJob } from './utils/waitForJob';
import { getTranscriptionResults } from './utils/getJobResults';

const transcribeClient = new TranscribeClient({ region: 'eu-west-1' });
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

  const jobName = `Transcribe-${object.key}`;

  const params: StartTranscriptionJobCommandInput = {
    TranscriptionJobName: jobName,
    IdentifyLanguage: true,
    Settings: { ShowSpeakerLabels: true, MaxSpeakerLabels: 10 },
    MediaFormat: 'mp4',
    Media: { MediaFileUri: `s3://${bucket.name}/${object.key}` },
  };

  try {
    const command = new StartTranscriptionJobCommand(params);
    await transcribeClient.send(command);

    const completedJob = await waitForTranscriptionJob({
      transcribeClient,
      jobName,
      maxWaitTime: MAX_WAIT_TIME,
      pollInterval: POLL_INTERVAL,
    });

    if (!completedJob.Transcript?.TranscriptFileUri) {
      throw new Error('No transcript file URI in completed job');
    }

    const { results } = await getTranscriptionResults(
      completedJob.Transcript.TranscriptFileUri,
    );

    const mergedSegments: { speaker_label: string; transcript: string }[] = [];

    results.audio_segments.forEach((segment) => {
      if (
        mergedSegments.length > 0 &&
        mergedSegments[mergedSegments.length - 1].speaker_label ===
          segment.speaker_label
      ) {
        // Merge with the last segment in mergedSegments
        const lastSegment = mergedSegments[mergedSegments.length - 1];
        lastSegment.transcript += ' ' + segment.transcript;
      } else {
        // Otherwise, add as a new segment
        mergedSegments.push({
          speaker_label: segment.speaker_label,
          transcript: segment.transcript,
        });
      }
    });

    console.dir({ mergedSegments }, { depth: Infinity });

    return { statusCode: 200, body: JSON.stringify(results) };
  } catch (error) {
    console.error('Error during transcription job:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: (error as Error).message }),
    };
  }
};
