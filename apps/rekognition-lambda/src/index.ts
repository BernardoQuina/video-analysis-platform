/* eslint-disable no-console */
import {
  RekognitionClient,
  DetectLabelsCommand,
  DetectLabelsCommandInput,
} from '@aws-sdk/client-rekognition';
// eslint-disable-next-line node/no-missing-import
import { SQSEvent, SQSRecord, APIGatewayProxyResult } from 'aws-lambda';

const rekognitionClient = new RekognitionClient({});

export const handler = async (
  event: SQSEvent,
): Promise<APIGatewayProxyResult> => {
  console.log({ event });

  const record: SQSRecord = event.Records[0];
  const message = JSON.parse(record.body);

  console.log({ message });

  const s3Bucket = message.Records[0].s3.bucket.name;
  const s3Key = message.Records[0].s3.object.key;

  const params: DetectLabelsCommandInput = {
    Image: {
      S3Object: {
        Bucket: s3Bucket,
        Name: s3Key,
      },
    },
    MaxLabels: 10,
    MinConfidence: 70,
  };

  console.log({ params });

  return { statusCode: 400, body: JSON.stringify({ error: 'Test request' }) };

  try {
    const command = new DetectLabelsCommand(params);
    const result = await rekognitionClient.send(command);
    console.log({ result });
    return { statusCode: 200, body: JSON.stringify(result) };
  } catch (error) {
    console.error('Error detecting labels:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: (error as Error).message }),
    };
  }
};
