import { useRouter } from 'next/router';
import { Cpu } from 'lucide-react';

import { PageLayout } from '../../components/page-layout';
import { RouterOutput, trpc } from '../../utils/trpc';
// import { VideoPlayer } from '../../components/video-player';
import { VideoErrorBanner } from '../../components/video-error-banners';
import { Skeleton } from '../../components/ui/skeleton';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs';
import { Separator } from '../../components/ui/separator';
import { PulsatingBorder } from '../../components/pulsating-border';

export default function Videos() {
  const router = useRouter();

  const { id } = router.query;

  const {
    data: video,
    error,
    isLoading,
  } = trpc.videos.singleVideo.useQuery(
    { videoId: id as string },
    { enabled: !!id },
  );

  return (
    <PageLayout
      pageTitle="Video Analysis Library"
      pageDescription="Discover and explore video analyses in the Video Analysis Library. Access your own videos insights and browse public analyses from other users"
    >
      {isLoading ? (
        <LoadingSkeleton />
      ) : error ? (
        <div className="items-center">
          <VideoErrorBanner
            title={
              error.data?.code === 'NOT_FOUND'
                ? 'Video not found'
                : 'Something went wrong'
            }
            message={
              error.data?.code === 'NOT_FOUND'
                ? "We couldn't find the video you're looking for."
                : error.message
            }
          />
        </div>
      ) : video ? (
        <div className="gap-4">
          {/* <VideoPlayer video={video} /> */}
          <div className="gap-2">
            <h1 className="text-2xl font-medium leading-none">
              {video.fileName}
            </h1>
            <p className="text-muted-foreground text-sm">
              Showcase of AI-driven analysis with AWS-powered services, offering
              transcriptions, object detection, and intelligent Q&A through
              cloud technology.
            </p>
            {/* <JobTabs video={video} /> */}

            <p className="text-muted-foreground my-6 text-sm">
              Scroll test paragraph
            </p>
            <p className="text-muted-foreground my-6 text-sm">
              Scroll test paragraph
            </p>
            <p className="text-muted-foreground my-6 text-sm">
              Scroll test paragraph
            </p>
            <p className="text-muted-foreground my-6 text-sm">
              Scroll test paragraph
            </p>
            <p className="text-muted-foreground my-6 text-sm">
              Scroll test paragraph
            </p>
            <p className="text-muted-foreground my-6 text-sm">
              Scroll test paragraph
            </p>
            <p className="text-muted-foreground my-6 text-sm">
              Scroll test paragraph
            </p>
            <p className="text-muted-foreground my-6 text-sm">
              Scroll test paragraph
            </p>
            <p className="text-muted-foreground my-6 text-sm">
              Scroll test paragraph
            </p>
            <p className="text-muted-foreground my-6 text-sm">
              Scroll test paragraph
            </p>
            <p className="text-muted-foreground my-6 text-sm">
              Scroll test paragraph
            </p>
            <p className="text-muted-foreground my-6 text-sm">
              Scroll test paragraph
            </p>
            <p className="text-muted-foreground my-6 text-sm">
              Scroll test paragraph
            </p>
            <p className="text-muted-foreground my-6 text-sm">
              Scroll test paragraph
            </p>
            <p className="text-muted-foreground my-6 text-sm">
              Scroll test paragraph
            </p>
            <p className="text-muted-foreground my-6 text-sm">
              Scroll test paragraph
            </p>
            <p className="text-muted-foreground my-6 text-sm">
              Scroll test paragraph
            </p>
          </div>
        </div>
      ) : null}
    </PageLayout>
  );
}

function LoadingSkeleton() {
  return (
    <div>
      <Skeleton className="-ml-4 -mt-4 aspect-video max-h-[60vh] min-w-[calc(100%+2rem)] rounded-none text-white shadow-md md:ml-0 md:mt-0 md:min-w-full md:rounded-md" />
    </div>
  );
}

type Video = RouterOutput['videos']['singleVideo'];

function _JobTabs({ video }: { video: Video }) {
  return (
    <Tabs defaultValue="transcript">
      <TabsList className="flex-row">
        <TabsTrigger value="transcript">Transcript</TabsTrigger>
        <Separator orientation="vertical" className="h-[50%]" />
        <TabsTrigger value="summary">Summary</TabsTrigger>
        <Separator orientation="vertical" className="h-[50%]" />
        <TabsTrigger value="prompt">Prompt</TabsTrigger>
        <Separator orientation="vertical" className="h-[50%]" />
        <TabsTrigger value="objectDetection">Object detection</TabsTrigger>
      </TabsList>
      <TabsContent value="transcript" className="gap-4 pb-4">
        {video.transcriptResult ? null : (
          <>
            <PulsatingBorder>
              <Cpu className="text-primary animate-spring-spin h-4 w-4" />
              <span className="text-primary animate-pulse text-xs font-medium">
                Processing transcription job
              </span>
            </PulsatingBorder>
            <p className="text-muted-foreground text-sm">
              <span className="text-primary font-medium">
                [Takes about 1-3 minutes]
              </span>{' '}
              Amazon Transcribe is used to detect the language and convert
              spoken words in your video into text. This feature is perfect for
              extracting dialogues or speeches, making it easier to analyze,
              search, or share what was said in your video.
            </p>
          </>
        )}
      </TabsContent>
      <TabsContent value="summary" className="gap-4 pb-4">
        {video.analysisResult ? null : (
          <>
            <PulsatingBorder>
              <Cpu className="text-primary animate-spring-spin h-4 w-4" />
              <span className="text-primary animate-pulse text-xs font-medium">
                Processing summary job
              </span>
            </PulsatingBorder>
            <p className="text-muted-foreground text-sm">
              <span className="text-primary font-medium">
                [Takes about 3-10 minutes depending on wether the cluster is
                scaling from zero]
              </span>{' '}
              Using an open source AI model, Video-LLaVA, self hosted on a AWS
              ECS Cluster, this job combines video and text analysis to
              interpret what is happening as the video progresses.
            </p>
          </>
        )}
      </TabsContent>
      <TabsContent value="prompt" className="gap-4 pb-4">
        {video.analysisResult ? null : (
          <>
            <PulsatingBorder>
              <Cpu className="text-primary animate-spring-spin h-4 w-4" />
              <span className="text-primary animate-pulse text-xs font-medium">
                Processing prompt job
              </span>
            </PulsatingBorder>
            <p className="text-muted-foreground text-sm">
              <span className="text-primary font-medium">
                [Takes about 3-10 minutes depending on wether the cluster is
                scaling from zero]
              </span>{' '}
              Using an open source AI model, Video-LLaVA, self hosted on a AWS
              ECS Cluster, this job combines video and text analysis to answer
              your questions about the video.
            </p>
          </>
        )}
      </TabsContent>
      <TabsContent value="objectDetection" className="gap-4 pb-4">
        {video.rekognitionObjects ? null : (
          <>
            <PulsatingBorder>
              <Cpu className="text-primary animate-spring-spin h-4 w-4" />
              <span className="text-primary animate-pulse text-xs font-medium">
                Processing object detection job
              </span>
            </PulsatingBorder>
            <p className="text-muted-foreground text-sm">
              <span className="text-primary font-medium">
                [Takes about 1-3 minutes]
              </span>{' '}
              Amazon Rekognition is used to identify objects, scenes, and
              activities within your video. Each result is paired with
              timestamps and levels of confidence.
            </p>
          </>
        )}
      </TabsContent>
    </Tabs>
  );
}
