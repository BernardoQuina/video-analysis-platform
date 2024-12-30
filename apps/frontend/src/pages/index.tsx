import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, ExternalLink, Github } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ReactFlowProvider } from '@xyflow/react';

import { trpc } from '../utils/trpc';
import { PageLayout } from '../components/page-layout';
import { Button } from '../components/ui/button';

const InfraDiagram = dynamic(
  () => import('../components/diagrams/infra-diagram'),
  { ssr: false },
);
const CICDDiagram = dynamic(
  () => import('../components/diagrams/ci-cd-diagram'),
  { ssr: false },
);

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
      <div className="gap-36">
        <section className="items-center gap-8 self-center pt-36 md:pt-52">
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
        </section>
        <section className="items-center gap-4">
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
              components, and how they interact.
            </p>
          </div>
          <ReactFlowProvider>
            <InfraDiagram />
          </ReactFlowProvider>
        </section>
        <section className="items-center gap-4">
          <div className="items-center gap-2">
            <div className="flex-row items-center gap-6">
              <div className="relative h-[1px] w-[calc(50vw-6rem)] max-w-52 bg-gradient-to-l from-black/30 to-transparent dark:from-white/30">
                <div className="from-red/30 absolute right-0 top-0 h-[1px] w-full bg-gradient-to-l from-black/30 to-transparent blur-[2px] dark:from-white/60"></div>
              </div>
              <h3 className="min-w-fit text-center text-lg font-medium">
                CI/CD Workflow Overview
              </h3>
              <div className="relative h-[1px] w-[calc(50vw-6rem)] max-w-52 bg-gradient-to-r from-black/30 to-transparent dark:from-white/30">
                <div className="from-red/30 absolute left-0 top-0 h-[1px] w-full bg-gradient-to-r from-black/30 to-transparent blur-[2px] dark:from-white/60"></div>
              </div>
            </div>
            <p className="max-w-[21rem] text-center text-sm">
              See how GitHub Actions deploy code changes and how CloudFormation
              updates the infrastructure.
            </p>
          </div>
          <ReactFlowProvider>
            <CICDDiagram />
          </ReactFlowProvider>
        </section>
        <section className="items-center gap-4">
          <div className="items-center gap-2">
            <div className="flex-row items-center gap-6">
              <div className="relative h-[1px] w-[calc(50vw-6rem)] max-w-52 bg-gradient-to-l from-black/30 to-transparent dark:from-white/30">
                <div className="from-red/30 absolute right-0 top-0 h-[1px] w-full bg-gradient-to-l from-black/30 to-transparent blur-[2px] dark:from-white/60"></div>
              </div>
              <h3 className="min-w-fit text-center text-lg font-medium">
                Project Insights
              </h3>
              <div className="relative h-[1px] w-[calc(50vw-6rem)] max-w-52 bg-gradient-to-r from-black/30 to-transparent dark:from-white/30">
                <div className="from-red/30 absolute left-0 top-0 h-[1px] w-full bg-gradient-to-r from-black/30 to-transparent blur-[2px] dark:from-white/60"></div>
              </div>
            </div>
            <p className="max-w-[21rem] text-center text-sm">
              Reflecting on challenges, learnings and decisions behind building
              a scalable AI video analysis platform.
            </p>
          </div>
          <div className="bg-background/50 w-full gap-4 rounded-xl border p-4 shadow-sm sm:p-6 md:p-8">
            <p>
              The development of complex cloud-native applications presents
              unique challenges that extend far beyond writing code. This
              article delves into my experience building a comprehensive video
              analysis platform on AWS, highlighting the critical lessons
              learned about cloud architecture, infrastructure automation, and
              the intricacies of deploying AI-powered applications at scale.
            </p>
            <h4 className="pt-2 text-xl font-medium">Challenges Faced</h4>
            <p>
              The journey of building this platform revealed several significant
              challenges that tested both technical skills and project
              management capabilities. The most prominent challenge was the
              considerable scope expansion that occurred during development.
              What began as a seemingly straightforward demonstration of AWS
              capabilities evolved into an intricate system encompassing
              multiple microservices, AI processing pipelines, and automated
              deployment workflows. This scope expansion (among other things
              I&apos;ll go through in this article) doubled the initially
              projected timeline, highlighting the importance of comprehensive
              project planning when dealing with complex cloud architectures.
            </p>
            <p>
              Technical complexity peaked during the implementation of the
              custom AI analysis model. As a Node.js developer, building and
              deploying a Python-based application using the Video-Llava model
              presented a significant learning curve. The requirement for
              GPU-enabled instances not only complicated the development and
              testing process but also introduced unique deployment challenges.
              Managing the model&apos;s substantial 20GB file size required
              careful consideration of build processes, deployment strategies,
              and instance startup times. The solution ultimately involved
              creating custom AMIs with pre-cached model files, though this
              introduced its own set of challenges in the CI/CD pipeline.
            </p>
            <p>
              Cost optimization emerged as another critical challenge,
              particularly given the compute-intensive nature of AI video
              analysis. The solution required careful architectural decisions to
              maintain performance while minimizing expenses. This included
              utilizing AWS free tier services where possible, implementing
              scale-to-zero capabilities for GPU instances, and making strategic
              trade-offs between ideal architecture and cost-effective
              solutions. For instance, while placing services in private subnets
              with NAT gateways would have been architecturally preferable, the
              cost implications led to a security group-based approach with
              public subnets. Despite using more than 20 services/components the
              base monthly cost of the project is below 20 dollars.
            </p>
            <h4 className="pt-2 text-xl font-medium">Key Takeaways</h4>
            <p>
              The implementation of an event-driven microservices architecture
              proved to be a double-edged sword. While it provided exceptional
              system resilience and optimal resource utilization, it also
              significantly increased development complexity and time
              investment. This experience highlighted the importance of
              carefully weighing the benefits of distributed architectures
              against the increased development and maintenance overhead,
              particularly for solo developers or small teams, or when dealing
              with tight time frames for a project.
            </p>
            <p>
              Working extensively with AWS services reinforced both the
              platform&apos;s capabilities and its complexities. The vast AWS
              ecosystem enabled the implementation of sophisticated features and
              robust infrastructure, but it also emphasized the critical
              importance of careful resource management and security
              considerations. The experience underscored that with great power
              comes great responsibility – particularly in managing costs and
              ensuring secure deployment configurations.
            </p>
            <p>
              The implementation of infrastructure as code using CloudFormation
              and automated deployments through GitHub Actions proved
              invaluable. These practices not only provided consistency and
              predictability in deployments but also served as living
              documentation of the system architecture. The initial investment
              in setting up these automation pipelines, while substantial, paid
              dividends throughout the development process and would continue to
              do so throughout the project lifecycle if it were to continue.
            </p>
            <h4 className="pt-2 text-xl font-medium">Areas for Improvement</h4>
            <p>
              Several areas of the platform could be enhanced with additional
              development time. The integration of API Gateway could provide
              improved security through rate limiting and caching capabilities,
              while implementing AWS WAF for both CloudFront distributions would
              enhance protection against web exploits. Moving compute resources
              to private subnets with NAT gateways would align better with
              security best practices, though at an increased cost.
            </p>
            <p>
              Technical optimizations could significantly improve system
              efficiency. The current thumbnail generation process could be
              optimized to process only relevant video segments, and a more
              streamlined solution for managing the analysis model image could
              reduce deployment complexity. The frontend user interface, while
              functional, could benefit from enhanced UX design to better
              showcase the platform&apos;s capabilities.
            </p>
            <p>
              Perhaps most importantly, the experience has emphasized the
              critical importance of thorough initial planning and realistic
              scope assessment. Future projects I&apos;ll work on will benefit
              from more extensive upfront architecture design and careful
              consideration of implementation timelines, particularly when
              working with unfamiliar technologies or complex infrastructure
              requirements.
            </p>
            <p>
              This project serves as a testament to the power of modern cloud
              platforms while highlighting the complexity of building
              production-ready systems. The challenges I encountered and lessons
              I&apos;ve learned provide me valuable insights for future
              cloud-native application that I&apos;ll build, particularly in the
              realm of AI-powered services and event-driven architectures.
            </p>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
