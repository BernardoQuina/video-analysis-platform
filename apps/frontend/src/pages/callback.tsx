/* eslint-disable no-console */
import { useEffect } from 'react';
import { Metadata } from 'next';
import { useRouter, useSearchParams } from 'next/navigation';

import { trpc } from '../utils/trpc';
import { PageLayout } from '../components/PageLayout';

export const metadata: Metadata = {
  title: 'Video Analysis Demo - Callback',
  description: 'sign in callback page',
};

export default function Home() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  const { mutateAsync, error } = trpc.auth.exchangeCodeForToken.useMutation();

  const router = useRouter();

  useEffect(() => {
    if (!code) return;

    const signIn = async () => {
      const { message } = await mutateAsync({ code });

      if (message === 'Authenticated') router.push('/');
    };

    signIn();
  }, [code, mutateAsync, router]);

  if (!code) return <div>Code from callback not present.</div>;

  if (error) {
    return (
      <div>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <PageLayout>
      <p>callback!</p>
    </PageLayout>
  );
}
