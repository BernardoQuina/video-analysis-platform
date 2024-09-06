import { trpc } from '../utils/trpc';

export default function Home() {
  const { data } = trpc.test.useQuery();

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <head>
        <title>this is the title</title>
      </head>
      {data.message}
    </div>
  );
}
