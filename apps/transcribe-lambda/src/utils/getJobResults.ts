import { URL } from 'node:url';

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

type GetTranscriptionResultsOptions = {
  s3Client: S3Client;
  transcriptFileUri: string;
};

type TranscriptionResult = {
  jobName: string;
  accountId: string;
  results: {
    transcripts: { transcript: string }[];
    items: {
      start_time?: string;
      end_time?: string;
      alternatives: { confidence: string; content: string }[];
      type: string;
    }[];
  };
  status: string;
};

export async function getTranscriptionResults({
  s3Client,
  transcriptFileUri,
}: GetTranscriptionResultsOptions): Promise<TranscriptionResult> {
  // Extract bucket and key from the S3 URI
  const url = new URL(transcriptFileUri);
  const bucket = url.hostname.split('.')[0];
  const key = url.pathname.substring(1); // Remove leading slash

  // Get the JSON file from S3
  const getCommand = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  const response = await s3Client.send(getCommand);

  // Convert the streaming body to string and parse JSON
  if (!response.Body) {
    throw new Error('No response body from S3');
  }

  const bodyContents = await response.Body.transformToString();
  return JSON.parse(bodyContents);
}
