import { trpc } from '../utils/trpc';

export default function Home() {
  const { data } = trpc.test.useQuery();

  if (!data) {
    return (
      <div>
        <p>hello from cloudfront</p>
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
      <p>Ec2 instance w/ id: {data.instanceId}</p>
      <p>Node.js worker with id: {data.workerId}</p>
    </div>
  );
}
