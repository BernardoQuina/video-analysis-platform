/* eslint-disable no-console */
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';
import {
  TranscribeClient,
  StartTranscriptionJobCommand,
  StartTranscriptionJobCommandInput,
} from '@aws-sdk/client-transcribe';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import type {
  APIGatewayProxyResult,
  EventBridgeEvent,
  S3ObjectCreatedNotificationEventDetail,
  // eslint-disable-next-line node/no-missing-import
} from 'aws-lambda';
import { useDB } from '@repo/db';

import { waitForTranscriptionJob } from './utils/wait-for-job';
import { getTranscriptionResults } from './utils/get-job-results';

type Metadata = {
  videoid: string;
  userid: string;
};

const transcribeClient = new TranscribeClient({
  region: process.env.AWS_REGION,
});
const s3Client = new S3Client({ region: process.env.AWS_REGION });
const sqsClient = new SQSClient({ region: process.env.AWS_REGION });

const db = useDB({
  region: process.env.AWS_REGION,
  tableName: process.env.DYNAMODB_TABLE_NAME,
});

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
  // TODO: remove to activate lambda
  // return { statusCode: 200, body: JSON.stringify({ message: 'Test' }) };
  const { bucket, object } = event.detail;

  const objectParams = { Bucket: bucket.name, Key: object.key };

  const { userid, videoid } = (
    await s3Client.send(new HeadObjectCommand(objectParams))
  ).Metadata as Metadata;

  const jobName = `Transcribe-${userid}-${videoid}`;

  const params: StartTranscriptionJobCommandInput = {
    TranscriptionJobName: jobName,
    IdentifyLanguage: true,
    Settings: { ShowSpeakerLabels: true, MaxSpeakerLabels: 10 },
    MediaFormat: 'mp4',
    Media: { MediaFileUri: `s3://${bucket.name}/${object.key}` },
  };

  try {
    // Get info from db
    const { data: videoItem } = await db.entities.videos
      .get({ id: videoid, userId: userid })
      .go();

    if (!videoItem) throw new Error('Video item not found in db.');

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
      completedJob.Transcript?.TranscriptFileUri ?? '',
    );

    const mergedSegments: {
      person: string;
      transcript: string;
      startTime: number;
      endTime: number;
    }[] = [];

    // Count the number of unique speakers
    const uniqueSpeakers = new Set(
      results.audio_segments.map((segment) => segment.speaker_label),
    ).size;

    results.audio_segments.forEach((segment) => {
      const personNumber = parseInt(segment.speaker_label.split('spk_')[1]) + 1;
      const person = `Person ${personNumber}`;
      const segmentStartTime = parseFloat(segment.start_time!);
      const segmentEndTime = parseFloat(segment.end_time!);

      if (
        uniqueSpeakers > 1 && // Only merge if more than one speaker
        mergedSegments.length > 0 &&
        mergedSegments[mergedSegments.length - 1].person === person &&
        segmentStartTime - mergedSegments[mergedSegments.length - 1].endTime <=
          1 // Threshold for merging
      ) {
        // Merge with the last segment
        const lastSegment = mergedSegments[mergedSegments.length - 1];
        lastSegment.transcript += ' ' + segment.transcript;
        lastSegment.endTime = segmentEndTime; // Update the endTime to the current segment's endTime
      } else {
        // Add a new segment
        mergedSegments.push({
          person,
          transcript: segment.transcript,
          startTime: segmentStartTime,
          endTime: segmentEndTime,
        });
      }
    });

    await db.entities.videos
      .update({ id: videoid, userId: userid })
      .set({ transcriptResult: mergedSegments })
      .go();

    // Send message to sqs for analysis model to answer prompt
    const video_s3_uri = `s3://${bucket.name}/${object.key}`;

    let transcript = 'START OF TRANSCRIPT:\n';

    mergedSegments.forEach((segment, i) => {
      transcript += `${segment.person} [${segment.startTime.toFixed(2)}s]: ${segment.transcript}\n`;

      if (i === mergedSegments.length - 1)
        transcript += 'END OF TRANSCRIPT\nUSER PROMPT:\n';
    });

    const sqsMessage = {
      video_s3_uri,
      prompt: `${transcript !== 'TRANSCRIPT:\n' ? `\n${transcript}` : ''}${videoItem.prompt}`,
    };

    const sendMessageCommand = new SendMessageCommand({
      QueueUrl: process.env.SQS_QUEUE_URL!,
      MessageBody: JSON.stringify(sqsMessage),
    });

    await sqsClient.send(sendMessageCommand);
    console.log('Message sent to SQS:', sqsMessage);

    return { statusCode: 200, body: JSON.stringify(results) };
  } catch (err) {
    const error = err as Error;
    console.error('Error during transcription job:', error);

    // Save error in db video item
    await db.entities.videos
      .update({ id: videoid, userId: userid })
      .set({ transcriptError: error.message })
      .go();

    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
