import {
  TranscribeClient,
  GetTranscriptionJobCommand,
  TranscriptionJob,
} from '@aws-sdk/client-transcribe';

type WaitForTranscriptionJobOptions = {
  transcribeClient: TranscribeClient;
  jobName: string;
  maxWaitTime: number;
  pollInterval: number;
};

export async function waitForTranscriptionJob({
  transcribeClient,
  jobName,
  maxWaitTime,
  pollInterval,
}: WaitForTranscriptionJobOptions): Promise<TranscriptionJob> {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitTime) {
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
        await new Promise((resolve) => setTimeout(resolve, pollInterval));
        continue;
      default:
        throw new Error(`Unknown job status: ${job.TranscriptionJobStatus}`);
    }
  }

  throw new Error('Transcription job timed out');
}
