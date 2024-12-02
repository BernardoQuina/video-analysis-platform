import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, ExternalLink, Github } from 'lucide-react';
import Link from 'next/link';

import { PageLayout } from '../components/page-layout';
import { trpc } from '../utils/trpc';
import { Button } from '../components/ui/button';

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
      <div className="items-center gap-6 self-center pt-10">
        <Button
          className="flex-row items-center gap-1 rounded-full text-sm"
          variant="outline"
          asChild
        >
          <a
            href="https://www.linkedin.com/in/bernardo-quina/"
            target="_blank"
            rel="noreferrer"
          >
            <span className="text-sm">Made by</span>
            Bernardo Quina
            <ExternalLink className="ml-2" />
          </a>
        </Button>
        <h1 className="text-center text-2xl font-medium sm:text-3xl md:text-4xl lg:text-5xl">
          AI Video Analysis Powered by AWS <br className="xs:block hidden" />{' '}
          Infrastructure And Services
        </h1>
        <p className="max-w-full text-center text-sm sm:max-w-[80%] sm:text-base lg:max-w-[60%]">
          Try out this demo that will generate transcriptions, object detection
          summaries and intelligent Q&A from your uploads and explore how the
          infra is deployed in AWS.
        </p>
        <div className="flex-row gap-4 pt-4">
          <Button asChild>
            <a
              href="https://www.github.com/BernardoQuina/video-analysis-platform"
              target="_blank"
              rel="noreferrer"
            >
              View Source Code <Github />
            </a>
          </Button>
          <Button variant="rainbow" asChild>
            <Link href="/videos">
              Try Video Analysis
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
