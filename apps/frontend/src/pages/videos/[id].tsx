import { RefObject, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Cpu } from 'lucide-react';
import { MediaPlayerInstance, useMediaRemote } from '@vidstack/react';
import moment from 'moment';

import { PageLayout } from '../../components/page-layout';
import { RouterOutput, trpc } from '../../utils/trpc';
import { VideoPlayer } from '../../components/video-player';
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

  const playerRef = useRef<MediaPlayerInstance>(null);

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
          <VideoPlayer video={video} playerRef={playerRef} />
          <div className="gap-2">
            <h1 className="text-2xl font-medium leading-none">
              {video.fileName}
            </h1>
            <p className="text-muted-foreground text-sm">
              Showcase of AI-driven analysis with AWS-powered services, offering
              transcriptions, object detection, and intelligent Q&A through
              cloud technology.
            </p>
            <JobTabs video={video} playerRef={playerRef} />
          </div>
        </div>
      ) : null}
    </PageLayout>
  );
}

function LoadingSkeleton() {
  return (
    <div className="gap-4">
      <Skeleton className="-ml-4 -mt-4 aspect-video max-h-[60vh] min-w-[calc(100%+2rem)] rounded-none text-white shadow-md md:ml-0 md:mt-0 md:min-w-full md:rounded-md" />

      <div className="gap-2">
        <Skeleton className="h-8 w-[60%]" />
        <Skeleton className="h-4" />
        <Skeleton className="h-4" />
      </div>
      <div className="gap-4 pt-4">
        <Skeleton className="h-8 w-full max-w-[30rem]" />
        <div className="gap-2">
          <Skeleton className="h-4" />
          <Skeleton className="h-4" />
          <Skeleton className="h-4" />
          <Skeleton className="h-4" />
        </div>
      </div>
    </div>
  );
}

type Video = RouterOutput['videos']['singleVideo'];

type JobTabsProps = {
  video: Video;
  playerRef: RefObject<MediaPlayerInstance>;
};

function JobTabs({ video, playerRef }: JobTabsProps) {
  // Changed to controlled tab state on click because default on key down
  // was causing problems with the video player (unwanted play click)
  const [tab, setTab] = useState<
    'transcript' | 'summary' | 'prompt' | 'objectDetection'
  >('transcript');

  return (
    <Tabs value={tab} onPointerDown={(event) => event.preventDefault()}>
      <TabsList className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-14 flex-row backdrop-blur">
        <TabsTrigger value="transcript" onClick={() => setTab('transcript')}>
          Transcript
        </TabsTrigger>
        <Separator orientation="vertical" className="h-[50%]" />
        <TabsTrigger value="summary" onClick={() => setTab('summary')}>
          Summary
        </TabsTrigger>
        <Separator orientation="vertical" className="h-[50%]" />
        <TabsTrigger value="prompt" onClick={() => setTab('prompt')}>
          Prompt
        </TabsTrigger>
        <Separator orientation="vertical" className="h-[50%]" />
        <TabsTrigger
          value="objectDetection"
          onClick={() => setTab('objectDetection')}
        >
          Object detection
        </TabsTrigger>
      </TabsList>
      <TabsContent value="transcript" className="gap-4 pb-20">
        {!video.transcriptResult ? (
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
        ) : video.transcriptResult.length === 0 ? null : (
          video.transcriptResult.map((segment) => (
            <TranscriptSegment
              key={segment.startTime}
              segment={segment}
              playerRef={playerRef}
            />
          ))
        )}
      </TabsContent>
      <TabsContent value="summary" className="gap-4 pb-20">
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
      <TabsContent value="prompt" className="gap-4 pb-20">
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
      <TabsContent value="objectDetection" className="gap-4 pb-20">
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

type Segment = NonNullable<Video['transcriptResult']>[number];

type TranscriptSegmentProps = {
  segment: Segment;
  playerRef: RefObject<MediaPlayerInstance>;
};

function TranscriptSegment({ segment, playerRef }: TranscriptSegmentProps) {
  const remote = useMediaRemote(playerRef);

  const timestamp = useMemo(() => {
    // Floor the input to ensure whole seconds
    const flooredTime = Math.floor(segment.startTime);

    // Use moment.duration to handle the time conversion
    const duration = moment.duration(flooredTime, 'seconds');

    // Format the duration as "MM:SS"
    const formattedTime = moment.utc(duration.asMilliseconds()).format('mm:ss');

    return formattedTime;
  }, [segment]);

  function jumpToSegment() {
    remote.seek(segment.startTime);

    window.scrollTo({ top: 0, behavior: 'smooth' });
    remote.play();
  }

  return (
    <>
      <div className="flex-row gap-2">
        <div>
          <button
            className="text-muted-foreground decoration-muted-foreground w-11 text-sm underline-offset-4 hover:underline"
            onClick={jumpToSegment}
          >
            <span>{timestamp}</span>
          </button>
        </div>
        <div className="gap-2">
          <span className="text-sm font-bold">{segment.person}</span>
          <p>{segment.transcript}</p>
        </div>
      </div>
      <Separator />
    </>
  );
}
