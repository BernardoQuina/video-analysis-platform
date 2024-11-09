import { useEffect } from 'react';
import { Metadata } from 'next';
import { useRouter, useSearchParams } from 'next/navigation';

import { PageLayout } from '../components/PageLayout';
import { trpc } from '../utils/trpc';
import { Button } from '../components/ui/button';

export const metadata: Metadata = {
  title: 'Video Analysis Demo',
  description:
    'This is a demo project showcasing how you can deploy complex applications on AWS infrastructure, making use of multiple services like S3, CloudFront, ECS, SQS, DynamoDB and more while still being cost efficient and having a simple but well rounded CI/CD',
};

export default function Home() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  const { mutateAsync } = trpc.auth.exchangeCodeForToken.useMutation();

  const { data: me } = trpc.auth.me.useQuery();

  const { data: myCollections, refetch } = trpc.auth.userCollections.useQuery(
    undefined,
    { enabled: false },
  );

  const utils = trpc.useUtils();

  const router = useRouter();

  useEffect(() => {
    if (!code) return;

    const signIn = async () => {
      const { message } = await mutateAsync({ code });

      if (message === 'Authenticated') {
        utils.auth.me.invalidate();

        router.push('/');
      }
    };

    signIn();
  }, [code, mutateAsync, router, utils.auth.me]);

  if (myCollections) console.log({ myCollections });

  return (
    <PageLayout>
      {me && <Button onClick={() => refetch()}>Get my collections</Button>}
      <p className="py-10 font-medium">hello from cloudfront</p>
      <p className="py-10 font-medium">hello from cloudfront</p>
      <p className="py-10 font-medium">hello from cloudfront</p>
      <p className="py-10 font-medium">hello from cloudfront</p>
      <p className="py-10 font-medium">hello from cloudfront</p>
      <p className="py-10 font-medium">hello from cloudfront</p>
      <p className="py-10 font-medium">hello from cloudfront</p>
      <p className="py-10 font-medium">hello from cloudfront</p>
      <p className="py-10 font-medium">hello from cloudfront</p>
      <p className="py-10 font-medium">hello from cloudfront</p>
      <p className="py-10 font-medium">hello from cloudfront</p>
      <p className="py-10 font-medium">hello from cloudfront</p>
      <p className="py-10 font-medium">hello from cloudfront</p>
      <p className="py-10 font-medium">hello from cloudfront</p>
      <p className="py-10 font-medium">hello from cloudfront</p>
    </PageLayout>
  );
}
