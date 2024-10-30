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

export async function getTranscriptionResults(
  transcriptFileUri: string,
): Promise<TranscriptionResult> {
  const response = await fetch(transcriptFileUri);

  if (!response.ok) throw new Error('Job result S3 request was not ok');

  return response.json();
}
