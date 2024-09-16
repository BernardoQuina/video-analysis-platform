import { trpc } from '../utils/trpc';

export default function Home() {
  const { data } = trpc.test.useQuery();

  if (!data) {
    return (
      <div>
        <p>Hello from CloudFront!!!</p>
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
