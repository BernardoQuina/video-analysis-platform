import { Metadata } from 'next';

import { trpc } from '../utils/trpc';

export const metadata: Metadata = {
  title: 'Video Analysis Demo',
  description:
    'This is demo project to showcase how you can deploy complex applications on AWS infrastructure, making use of multiple services like S3, CloudFront, ECS, SQS, DynamoDB and more.',
};

export default function Home() {
  const { data } = trpc.test.useQuery();

  if (!data) {
    return (
      <div>
        <p>Hello from CloudFront!</p>
        <br />
        <p> Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <p>hello from cloudfront</p>
      <br />
      <p>Fetched data from:</p>
      <p>Ec2 instance id: {data.instanceId}</p>
      <p>Node worker id: {data.workerId}</p>
    </div>
  );
}
