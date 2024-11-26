import type { LabelDetection } from '@aws-sdk/client-rekognition';

type ConsolidatedLabel = {
  label: {
    name: string;
    categories: { name?: string }[];
    parents: { name?: string }[];
  };
  detections: {
    timestamp: number;
    confidence: number;
  }[];
};

export function consolidateLabels(labels: LabelDetection[]) {
  const labelMap = new Map<string, ConsolidatedLabel>();

  labels.forEach((item) => {
    if (!item.Label?.Name) return;

    const labelName = item.Label.Name;

    if (labelMap.has(labelName)) {
      // Add timestamp and confidence to existing label
      labelMap.get(labelName)!.detections.push({
        timestamp: item.Timestamp!,
        confidence: item.Label.Confidence!,
      });
    } else {
      // Create new consolidated label
      labelMap.set(labelName, {
        label: {
          name: item.Label.Name,
          categories: item.Label.Categories!.map((category) => ({
            name: category.Name,
          })),
          parents: item.Label.Parents!.map((parent) => ({ name: parent.Name })),
        },
        detections: [
          { timestamp: item.Timestamp!, confidence: item.Label.Confidence! },
        ],
      });
    }
  });

  return Array.from(labelMap.values());
}
