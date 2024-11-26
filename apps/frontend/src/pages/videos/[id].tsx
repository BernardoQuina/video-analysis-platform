import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { CheckCircle2, Cpu } from 'lucide-react';
import {
  MediaPlayerInstance,
  MediaRemoteControl,
  useMediaRemote,
} from '@vidstack/react';
import moment from 'moment';
import { toast } from 'sonner';

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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../components/ui/accordion';
import { cn } from '../../utils/cn';
import { Tip } from '../../components/ui/tooltip';

export default function Videos() {
  const [jobsStatus, setJobsStatus] = useState({
    transcript: 'unknown',
    objectDetection: 'unknown',
  });

  const router = useRouter();

  const { id } = router.query;

  const {
    data: video,
    error,
    isLoading,
  } = trpc.videos.singleVideo.useQuery(
    { videoId: id as string },
    {
      enabled: !!id,
      refetchInterval: () => {
        if (
          (jobsStatus.objectDetection === 'error' ||
            jobsStatus.objectDetection === 'complete') &&
          (jobsStatus.transcript === 'error' ||
            jobsStatus.transcript === 'complete')
        ) {
          return false;
        }
        return 5000;
      },
    },
  );

  const playerRef = useRef<MediaPlayerInstance>(null);
  const remote = useMediaRemote(playerRef);

  useEffect(() => {
    if (video) {
      // Check transcript status
      if (video.transcriptError) {
        setJobsStatus((prev) => {
          // If it was processing notify the user, otherwise just change status to stop refetching (polling for job completions)
          if (prev.transcript === 'processing') {
            toast.error('Transcription job failed', {
              description: video.transcriptError,
            });
          }
          return { ...prev, transcript: 'error' };
        });
      } else if (video.transcriptResult) {
        setJobsStatus((prev) => {
          // If it was processing notify the user, otherwise just change status to stop refetching (polling for job completions)
          if (prev.transcript === 'processing') {
            toast.success('Transcription job completed');
          }
          return { ...prev, transcript: 'complete' };
        });
      } else {
        // In this case its still processing
        setJobsStatus((prev) => ({ ...prev, transcript: 'processing' }));
      }

      // Check object detection status
      if (video.rekognitionObjectsError) {
        setJobsStatus((prev) => {
          // If it was processing notify the user, otherwise just change status to stop refetching (polling for job completions)
          if (prev.objectDetection === 'processing') {
            toast.error('Object detection job failed', {
              description: video.rekognitionObjectsError,
            });
          }
          return { ...prev, objectDetection: 'error' };
        });
      } else if (video.rekognitionObjects) {
        setJobsStatus((prev) => {
          // If it was processing notify the user, otherwise just change status to stop refetching (polling for job completions)
          if (prev.objectDetection === 'processing') {
            toast.success('Object detection job completed');
          }
          return { ...prev, objectDetection: 'complete' };
        });
      } else {
        // In this case its still processing
        setJobsStatus((prev) => ({ ...prev, objectDetection: 'processing' }));
      }
    }
  }, [video]);

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
            <JobTabs video={video} remote={remote} />
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

const jobDescriptions = {
  transcript:
    'Amazon Transcribe is used to detect the language and convert spoken words in your video into text. This feature is perfect for extracting dialogues or speeches, making it easier to analyze, search, or share what was said in your video.',
  summary:
    'Using an open source AI model, Video-LLaVA, self hosted on a AWS ECS Cluster, this job combines video and text analysis to interpret what is happening as the video progresses.',
  prompt:
    'Using an open source AI model, Video-LLaVA, self hosted on a AWS ECS Cluster, this job combines video and text analysis to answer your questions about the video.',
  objectDetection:
    'Amazon Rekognition is used to identify objects, scenes, and activities within your video. Each result is paired with timestamps and levels of confidence.',
};

type Video = RouterOutput['videos']['singleVideo'];

type JobTabsProps = {
  video: Video;
  remote: MediaRemoteControl;
};

function JobTabs({ video, remote }: JobTabsProps) {
  // Changed to controlled tab state on click because default on key down
  // was causing problems with the video player (unwanted play click)
  const [tab, setTab] = useState<
    'transcript' | 'summary' | 'prompt' | 'objectDetection'
  >('transcript');

  return (
    <Tabs value={tab} onPointerDown={(event) => event.preventDefault()}>
      <TabsList className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-14 z-10 flex-row backdrop-blur">
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
              {jobDescriptions.transcript}
            </p>
          </>
        ) : video.transcriptResult.length === 0 ? (
          <div className="gap-4">
            <Tip
              content={jobDescriptions.transcript}
              contentClassName="max-w-[80vw] sm:max-w-[40rem]"
              align="start"
            >
              <div className="w-fit flex-row gap-1.5 rounded-full border p-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-primary text-xs font-medium">
                  Transcription job complete
                </span>
              </div>
            </Tip>
            <p>No dialog or speech was detected in the video.</p>
          </div>
        ) : (
          <div className="gap-4">
            <Tip
              content={jobDescriptions.transcript}
              contentClassName="max-w-[80vw] sm:max-w-[40rem]"
              align="start"
            >
              <div className="w-fit flex-row gap-1.5 rounded-full border p-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-primary text-xs font-medium">
                  Transcription job complete
                </span>
              </div>
            </Tip>
            {video.transcriptResult.map((segment) => (
              <TranscriptSegment
                key={segment.startTime}
                segment={segment}
                remote={remote}
              />
            ))}
          </div>
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
              {jobDescriptions.summary}
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
              {jobDescriptions.prompt}
            </p>
          </>
        )}
      </TabsContent>
      <TabsContent value="objectDetection" className={cn('gap-4 pb-20', {})}>
        {!video.rekognitionObjects ? (
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
              {jobDescriptions.objectDetection}
            </p>
          </>
        ) : video.rekognitionObjects.length === 0 ? (
          <div className="gap-4">
            <Tip
              content={jobDescriptions.transcript}
              contentClassName="max-w-[80vw] sm:max-w-[40rem]"
              align="start"
            >
              <div className="w-fit flex-row gap-1.5 rounded-full border p-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-primary text-xs font-medium">
                  Object detection job complete
                </span>
              </div>
            </Tip>
            <p>No objects could be detected in the video.</p>
          </div>
        ) : (
          <div>
            <Tip
              content={jobDescriptions.objectDetection}
              contentClassName="max-w-[80vw] sm:max-w-[40rem]"
              align="start"
            >
              <div className="w-fit flex-row gap-1.5 rounded-full border p-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-primary text-xs font-medium">
                  Object detection job complete
                </span>
              </div>
            </Tip>
            <Accordion type="multiple">
              {video.rekognitionObjects.map((object) => (
                <RekognitionObject
                  key={object.label.name}
                  object={object}
                  remote={remote}
                />
              ))}
            </Accordion>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

type Segment = NonNullable<Video['transcriptResult']>[number];

type TranscriptSegmentProps = {
  segment: Segment;
  remote: MediaRemoteControl;
};

function TranscriptSegment({ segment, remote }: TranscriptSegmentProps) {
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

type RekognitionObject = NonNullable<Video['rekognitionObjects']>[number];

type RekognitionObjectProps = {
  object: RekognitionObject;
  remote: MediaRemoteControl;
};

function RekognitionObject({ object, remote }: RekognitionObjectProps) {
  const remHeight = useMemo(() => {
    // default 2 rem per row of detection
    if (object.detections.length > 1) return object.detections.length * 2.063;

    // If 1 or less but categories or parents occupy some space give 2rem
    if (object.label.categories.length > 3 || object.label.parents.length > 3) {
      return 4; // 4rem (64px)
    }

    if (
      object.label.categories.length > 1 ||
      object.label.categories[0]?.name.length > 10 ||
      object.label.parents.length > 1 ||
      object.label.parents[0]?.name.length > 10
    ) {
      return 3; // 3rem (48px)
    }

    return object.detections.length * 2;
  }, [object]);

  return (
    <AccordionItem value={object.label.name}>
      <AccordionTrigger className="bg-background/95 supports-[backdrop-filter]:bg-background/60 px-0 backdrop-blur sm:px-6">
        <span>{object.label.name}</span>
      </AccordionTrigger>
      <AccordionContent>
        <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-[9.45rem] h-16 flex-row items-center border-y backdrop-blur">
          <div className="h-full w-[40%] items-center">
            <div className="h-[calc(50%-0.5px)] justify-center">
              <span className="font-medium">Occurrences</span>
            </div>
            <Separator />
            <div className="h-[calc(50%-0.5px)] w-full flex-row items-center">
              <div className="w-[calc(50%-0.5px)] items-center">
                <span className="block font-medium sm:hidden">Time</span>
                <span className="hidden font-medium sm:block">Timestamp</span>
              </div>
              <Separator orientation="vertical" className="h-[50%]" />
              <div className="w-[calc(50%-0.5px)] items-center">
                <span className="block font-medium sm:hidden">Conf.</span>
                <span className="hidden font-medium sm:block">Confidence</span>
              </div>
            </div>
          </div>
          <Separator orientation="vertical" className="h-[50%]" />
          <div className="w-[calc(30%-1px)] items-center">
            <span className="font-medium">Categories</span>
          </div>
          <Separator orientation="vertical" className="h-[50%]" />
          <div className="w-[calc(30%-1px)] items-center">
            <span className="font-medium">Parents</span>
          </div>
        </div>
        <div
          style={
            {
              '--base-height': `${remHeight}rem`,
              '--sm-height': `${object.detections.length * 2.063}rem`,
            } as CSSProperties
          }
          className="h-[var(--base-height)] flex-row items-center sm:h-[var(--sm-height)]"
        >
          <div className="w-[40%] items-center">
            {object.detections.map((detection, i) => (
              <DetectionItem
                key={detection.timestamp}
                detection={detection}
                isLast={i === object.detections.length - 1}
                remote={remote}
              />
            ))}
          </div>
          <Separator
            orientation="vertical"
            className={
              object.detections.length > 1 ? 'h-[calc(100%-2rem)]' : 'h-[50%]'
            }
          />
          <div className="w-[calc(30%-1px)] items-center p-1">
            {object.label.categories.length === 0 ? (
              <span className="text-muted-foreground">N/A</span>
            ) : (
              object.label.categories.map((category, i) => (
                <span className="text-center" key={category.name}>
                  {category.name}
                  {i !== object.label.categories.length - 1 ? ', ' : ''}
                </span>
              ))
            )}
          </div>
          <Separator orientation="vertical" className="h-[calc(100%-2rem)]" />
          <div className="w-[calc(30%-1px)] items-center p-1">
            <span>
              {object.label.parents.length === 0 ? (
                <span className="text-muted-foreground">N/A</span>
              ) : (
                object.label.parents.map((parent, i) => (
                  <span className="text-center" key={parent.name}>
                    {parent.name}
                    {i !== object.label.parents.length - 1 ? ', ' : ''}
                  </span>
                ))
              )}
            </span>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

type Detection = RekognitionObject['detections'][number];

type DetectionItemProps = {
  detection: Detection;
  isLast: boolean;
  remote: MediaRemoteControl;
};

function DetectionItem({ detection, isLast, remote }: DetectionItemProps) {
  const timestamp = useMemo(() => {
    // Floor the input to ensure whole seconds
    const flooredTime = Math.floor(detection.timestamp);

    // Use moment.duration to handle the time conversion
    const duration = moment.duration(flooredTime, 'seconds');

    // Format the duration as "MM:SS"
    const formattedTime = moment.utc(duration.asMilliseconds()).format('mm:ss');

    return formattedTime;
  }, [detection]);

  function jumpToSegment() {
    remote.seek(detection.timestamp);

    window.scrollTo({ top: 0, behavior: 'smooth' });
    remote.play();
  }

  return (
    <>
      <div
        key={detection.timestamp}
        className="h-8 w-full flex-row items-center"
      >
        <button
          className="text-muted-foreground decoration-muted-foreground w-[calc(50%-0.5px)] items-center text-sm underline-offset-4 hover:underline"
          onClick={jumpToSegment}
        >
          <span>{timestamp}</span>
        </button>
        <Separator orientation="vertical" className="h-[50%]" />
        <div className="w-[calc(50%-0.5px)] items-center">
          <span>{parseFloat(detection.confidence.toFixed(2)).toString()}%</span>
        </div>
      </div>
      {!isLast && <Separator />}
    </>
  );
}
