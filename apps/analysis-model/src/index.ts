/* eslint-disable no-console */ import {
  SQSClient,
  ReceiveMessageCommand,
  // DeleteMessageCommand,
  Message,
} from '@aws-sdk/client-sqs';
import 'dotenv/config';

// Configure AWS SDK clients
const region = 'eu-west-1'; // Replace with your AWS region
const sqsClient = new SQSClient({ region });

type MessageBody = {
  video_path: string;
  text_prompt: string;
};

type Result = { text: string };

async function _analyzeVideo({
  video_path,
  text_prompt,
}: MessageBody): Promise<Result> {
  console.log('Analyzing video: ', video_path);

  const response = await fetch('http://localhost:5000/predictions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: { video_path, text_prompt } }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  console.log('Video analysis complete: ', result);

  return result;
}

async function processMessage(message: Message) {
  if (!message.Body) throw new Error('Message body is undefined');

  const messageBody: MessageBody = JSON.parse(message.Body);

  try {
    // await analyzeVideo(messageBody);
    console.log({ messageBody });
  } catch (error) {
    console.error(`Error processing video ${messageBody.video_path}:`, error);
    throw error; // Rethrow to trigger SQS message retention
  }
}

async function pollQueue() {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const command = new ReceiveMessageCommand({
        QueueUrl: process.env.SQS_QUEUE_URL,
        MaxNumberOfMessages: 1,
        WaitTimeSeconds: 20,
      });
      const { Messages } = await sqsClient.send(command);

      if (!Messages || Messages.length === 0) {
        console.log('No messages received, continuing to poll...');
        continue;
      }

      const message = Messages[0];
      console.log('Received message:', message.MessageId);

      await processMessage(message);

      // Delete the message from the queue
      // const deleteCommand = new DeleteMessageCommand({
      //   QueueUrl: process.env.SQS_QUEUE_URL,
      //   ReceiptHandle: message.ReceiptHandle,
      // });

      // await sqsClient.send(deleteCommand);

      // console.log(`Deleted message ${message.MessageId}`);
    } catch (error) {
      console.error('Error in poll loop:', error);

      // Wait before trying again to avoid flooding logs in case of persistent errors
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

// Start the application
console.log('Starting video analysis wrapper');
console.log('Queue url: ', process.env.SQS_QUEUE_URL);
pollQueue().catch((error) => {
  console.error('Fatal error in main loop:', error);
  throw error;
});
