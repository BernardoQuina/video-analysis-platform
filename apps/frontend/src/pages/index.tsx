import { trpc } from '../utils/trpc';

export default function Home() {
  const { data } = trpc.test.useQuery();

  if (!data) {
    return (
      <div>
        <p> Loading....</p>
      </div>
    );
  }

  return <div>{data.message}</div>;
}
