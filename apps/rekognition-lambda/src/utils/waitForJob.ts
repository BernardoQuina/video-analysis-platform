import {
  RekognitionClient,
  GetLabelDetectionCommand,
} from '@aws-sdk/client-rekognition';

type WaitForRekognitionJobOptions = {
  rekognitionClient: RekognitionClient;
  JobId: string;
  maxWaitTime: number;
  pollInterval: number;
};

export async function waitForRekognitionJob({
  rekognitionClient,
  JobId,
  maxWaitTime,
  pollInterval,
}: WaitForRekognitionJobOptions) {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitTime) {
    const command = new GetLabelDetectionCommand({
      JobId,
      AggregateBy: 'SEGMENTS',
    });

    const response = await rekognitionClient.send(command);

    if (!response.JobId) {
      throw new Error('Rekognition job not found');
    }

    switch (response.JobStatus) {
      case 'SUCCEEDED':
        return response;
      case 'FAILED':
        throw new Error(`Rekognition job failed: ${response.StatusMessage}`);
      case 'IN_PROGRESS':
        // Wait before checking again
        await new Promise((resolve) => setTimeout(resolve, pollInterval));
        continue;
      default:
        throw new Error(`Unknown job status: ${response.StatusMessage}`);
    }
  }

  throw new Error('Rekognition job timed out');
}
