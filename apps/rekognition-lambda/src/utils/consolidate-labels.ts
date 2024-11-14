import type { LabelDetection } from '@aws-sdk/client-rekognition';

type ConsolidatedLabel = {
  Label: {
    Name: string;
    Categories: { Name?: string }[];
    Parents: { Name?: string }[];
  };
  TimestampData: {
    Timestamp: number;
    Confidence: number;
  }[];
};

export function consolidateLabels(labels: LabelDetection[]) {
  const labelMap = new Map<string, ConsolidatedLabel>();

  labels.forEach((item) => {
    if (!item.Label?.Name) return;

    const labelName = item.Label.Name;

    if (labelMap.has(labelName)) {
      // Add timestamp and confidence to existing label
      labelMap.get(labelName)!.TimestampData.push({
        Timestamp: item.Timestamp!,
        Confidence: item.Label.Confidence!,
      });
    } else {
      // Create new consolidated label
      labelMap.set(labelName, {
        Label: {
          Name: item.Label.Name,
          Categories: item.Label.Categories!,
          Parents: item.Label.Parents!,
        },
        TimestampData: [
          {
            Timestamp: item.Timestamp!,
            Confidence: item.Label.Confidence!,
          },
        ],
      });
    }
  });

  return Array.from(labelMap.values());
}
