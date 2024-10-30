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
    audio_segments: {
      id: number;
      start_time?: string;
      end_time?: string;
      speaker_label: string;
      transcript: string;
      items: number[];
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
