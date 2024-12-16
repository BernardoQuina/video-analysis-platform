import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, ExternalLink, Github } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ReactFlowProvider } from '@xyflow/react';

import { PageLayout } from '../components/page-layout';
import { trpc } from '../utils/trpc';
import { Button } from '../components/ui/button';

const InfraDiagram = dynamic(() => import('../components/infra-diagram'), {
  ssr: false,
});

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
      backgroundEffects
    >
      <div className="gap-[14rem] sm:gap-36">
        <div className="items-center gap-8 self-center pt-36 md:pt-52">
          <Button
            className="flex-row items-center rounded-full text-sm"
            variant="outline"
            asChild
          >
            <a
              href="https://www.linkedin.com/in/bernardo-quina/"
              target="_blank"
              rel="noreferrer"
            >
              Made by Bernardo Quina
              <ExternalLink />
            </a>
          </Button>
          <div className="relative">
            {/* Decorative lines */}
            {/* Outer top */}
            <div className="linear-gradient-horizontal dark:linear-gradient-horizontal-dark absolute left-[50%] top-[-90px] h-[1px] w-[250%] translate-x-[-50%]"></div>
            <div className="linear-gradient-blur-horizontal dark:linear-gradient-blur-horizontal-dark absolute left-[50%] top-[-90px] h-[1px] w-[250%] translate-x-[-50%] blur-[2px]"></div>
            {/* Inner top */}
            <div className="linear-gradient-horizontal dark:linear-gradient-horizontal-dark absolute left-[50%] top-[-12px] h-[1px] w-[250%] translate-x-[-50%]"></div>
            <div className="linear-gradient-blur-horizontal dark:linear-gradient-blur-horizontal-dark absolute left-[50%] top-[-12px] h-[1px] w-[250%] translate-x-[-50%] blur-[2px]"></div>

            {/* Outer left */}
            <div className="linear-gradient dark:linear-gradient-dark absolute left-[-100px] top-[50%] h-[600%] w-[1px] translate-y-[-50%]"></div>
            <div className="linear-gradient-blur dark:linear-gradient-blur-dark absolute left-[-100px] top-[50%] h-[600%] w-[1px] translate-y-[-50%] blur-[2px]"></div>

            {/* Inner left */}
            <div className="linear-gradient dark:linear-gradient-dark absolute left-[-20px] top-[50%] h-[600%] w-[1px] translate-y-[-50%]"></div>
            <div className="linear-gradient-blur dark:linear-gradient-blur-dark absolute left-[-20px] top-[50%] h-[600%] w-[1px] translate-y-[-50%] blur-[2px]"></div>

            {/* Outer right */}
            <div className="linear-gradient dark:linear-gradient-dark absolute right-[-100px] top-[50%] h-[600%] w-[1px] translate-y-[-50%]"></div>
            <div className="linear-gradient-blur dark:linear-gradient-blur-dark absolute right-[-100px] top-[50%] h-[600%] w-[1px] translate-y-[-50%] blur-[2px]"></div>

            {/* Inner right */}
            <div className="linear-gradient dark:linear-gradient-dark absolute right-[-20px] top-[50%] h-[600%] w-[1px] translate-y-[-50%]"></div>
            <div className="linear-gradient-blur dark:linear-gradient-blur-dark absolute right-[-20px] top-[50%] h-[600%] w-[1px] translate-y-[-50%] blur-[2px]"></div>

            {/* Inner bottom */}
            <div className="linear-gradient-horizontal dark:linear-gradient-horizontal-dark absolute bottom-[-20px] left-[50%] h-[1px] w-[250%] translate-x-[-50%]"></div>
            <div className="linear-gradient-blur-horizontal dark:linear-gradient-blur-horizontal-dark absolute bottom-[-20px] left-[50%] h-[1px] w-[250%] translate-x-[-50%] blur-[2px]"></div>
            {/* Outer bottom */}
            <div className="linear-gradient-horizontal dark:linear-gradient-horizontal-dark absolute bottom-[-95px] left-[50%] h-[1px] w-[250%] translate-x-[-50%]"></div>
            <div className="linear-gradient-blur-horizontal dark:linear-gradient-blur-horizontal-dark absolute bottom-[-95px] left-[50%] h-[1px] w-[250%] translate-x-[-50%] blur-[2px]"></div>

            <h1 className="xs:text-4xl text-center text-3xl font-medium md:text-5xl lg:text-5xl">
              AI Video Analysis Demo <br /> powered by AWS
            </h1>
          </div>
          <p className="xs:max-w-[70%] max-w-[80%] text-center text-sm sm:max-w-[60%] sm:text-base lg:max-w-[60%]">
            Try out this video analysis generation demo and explore how the
            infra is deployed in AWS.
          </p>
          <div className="flex-row gap-4 pt-2">
            <Button asChild className="gap-1">
              <a
                href="https://www.github.com/BernardoQuina/video-analysis-platform"
                target="_blank"
                rel="noreferrer"
              >
                View <span className="xs:block hidden">Source</span>
                Code <Github className="ml-1.5" />
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
        <div className="items-center gap-10">
          <div className="items-center gap-2">
            <div className="flex-row items-center gap-6">
              <div className="relative h-[1px] w-[calc(50vw-6rem)] max-w-52 bg-gradient-to-l from-black/30 to-transparent dark:from-white/30">
                <div className="from-red/30 absolute right-0 top-0 h-[1px] w-full bg-gradient-to-l from-black/30 to-transparent blur-[2px] dark:from-white/60"></div>
              </div>
              <h3 className="min-w-fit text-center text-lg font-medium">
                Explore Infrastructure
              </h3>
              <div className="relative h-[1px] w-[calc(50vw-6rem)] max-w-52 bg-gradient-to-r from-black/30 to-transparent dark:from-white/30">
                <div className="from-red/30 absolute left-0 top-0 h-[1px] w-full bg-gradient-to-r from-black/30 to-transparent blur-[2px] dark:from-white/60"></div>
              </div>
            </div>
            <p className="max-w-[21rem] text-center text-sm">
              Dive into this AWS-deployed event-driven architecture, its
              components, and their current statuses.
            </p>
          </div>
          <ReactFlowProvider>
            <InfraDiagram />
          </ReactFlowProvider>
        </div>
      </div>
    </PageLayout>
  );
}
