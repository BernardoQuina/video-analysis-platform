import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { PageLayout } from '../components/page-layout';
import { trpc } from '../utils/trpc';

export default function Home() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  const { mutateAsync } = trpc.auth.exchangeCodeForToken.useMutation();

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

  return (
    <PageLayout
      pageTitle="Video Analysis Demo"
      pageDescription="This is a demo project showcasing how you can deploy complex applications on AWS infrastructure, making use of multiple services like S3, CloudFront, ECS, SQS, DynamoDB and more while still being cost efficient and having a simple but well-rounded CI/CD."
    >
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
