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
      <div className="items-center gap-8 self-center pt-32">
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
        <div className="relative overflow-visible">
          {/* Decorative lines */}
          {/* Outer top */}
          <div className="linear-gradient-horizontal dark:linear-gradient-horizontal-dark absolute left-[50%] top-[-90px] h-[1px] w-[250%] translate-x-[-50%]"></div>
          <div className="linear-gradient-blur-horizontal dark:linear-gradient-blur-horizontal-dark absolute left-[50%] top-[-90px] h-[1px] w-[250%] translate-x-[-50%] blur-[2px]"></div>
          {/* Inner top */}
          <div className="linear-gradient-horizontal dark:linear-gradient-horizontal-dark absolute left-[50%] top-[-12px] h-[1px] w-[250%] translate-x-[-50%]"></div>
          <div className="linear-gradient-blur-horizontal dark:linear-gradient-blur-horizontal-dark absolute left-[50%] top-[-12px] h-[1px] w-[250%] translate-x-[-50%] blur-[2px]"></div>

          {/* Outer left */}
          <div className="linear-gradient dark:linear-gradient-dark absolute left-[-100px] top-[-30vh] h-[80vh] w-[1px]"></div>
          <div className="linear-gradient-blur dark:linear-gradient-blur-dark absolute left-[-100px] top-[-30vh] h-[80vh] w-[1px] blur-[2px]"></div>

          {/* Inner left */}
          <div className="linear-gradient dark:linear-gradient-dark absolute left-[-20px] top-[-30vh] h-[80vh] w-[1px]"></div>
          <div className="linear-gradient-blur dark:linear-gradient-blur-dark absolute left-[-20px] top-[-30vh] h-[80vh] w-[1px] blur-[2px]"></div>

          {/* Outer right */}
          <div className="linear-gradient dark:linear-gradient-dark absolute right-[-100px] top-[-30vh] h-[80vh] w-[1px]"></div>
          <div className="linear-gradient-blur dark:linear-gradient-blur-dark absolute right-[-100px] top-[-30vh] h-[80vh] w-[1px] blur-[2px]"></div>

          {/* Inner right */}
          <div className="linear-gradient dark:linear-gradient-dark absolute right-[-20px] top-[-30vh] h-[80vh] w-[1px]"></div>
          <div className="linear-gradient-blur dark:linear-gradient-blur-dark absolute right-[-20px] top-[-30vh] h-[80vh] w-[1px] blur-[2px]"></div>

          {/* Inner bottom */}
          <div className="linear-gradient-horizontal dark:linear-gradient-horizontal-dark absolute bottom-[-20px] left-[50%] h-[1px] w-[250%] translate-x-[-50%]"></div>
          <div className="linear-gradient-blur-horizontal dark:linear-gradient-blur-horizontal-dark absolute bottom-[-20px] left-[50%] h-[1px] w-[250%] translate-x-[-50%] blur-[2px]"></div>
          {/* Outer bottom */}
          <div className="linear-gradient-horizontal dark:linear-gradient-horizontal-dark absolute bottom-[-95px] left-[50%] h-[1px] w-[250%] translate-x-[-50%]"></div>
          <div className="linear-gradient-blur-horizontal dark:linear-gradient-blur-horizontal-dark absolute bottom-[-95px] left-[50%] h-[1px] w-[250%] translate-x-[-50%] blur-[2px]"></div>

          <h1 className="text-center text-3xl font-medium sm:text-3xl md:text-4xl lg:text-5xl">
            AI Video Analysis Demo <br /> powered by AWS
          </h1>
        </div>
        <p className="xs:max-w-[70%] max-w-[80%] text-center text-sm sm:max-w-[60%] sm:text-base lg:max-w-[60%]">
          Try out this video analysis generation demo and explore how the infra
          is deployed in AWS.
        </p>
        <div className="flex-row gap-4 pt-4">
          <Button asChild className="gap-1">
            <a
              href="https://www.github.com/BernardoQuina/video-analysis-platform"
              target="_blank"
              rel="noreferrer"
            >
              View <span className="xs:block hidden">Source</span>
              Code <Github />
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
