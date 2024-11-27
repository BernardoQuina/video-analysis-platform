import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { MediaPlayerInstance, useMediaRemote } from '@vidstack/react';
import { toast } from 'sonner';
import moment from 'moment';
import { inferProcedureOutput } from '@trpc/server';
import { TRPCClientError } from '@trpc/client';
import {
  CheckCircle2,
  Cpu,
  Eye,
  Loader2,
  Lock,
  Settings2,
  Trash2,
  XCircle,
} from 'lucide-react';

import { AppRouter } from '../../../../api/src/routers/index.router';
import { PageLayout } from '../../components/page-layout';
import { trpc } from '../../utils/trpc';
import { VideoPlayer } from '../../components/video-player';
import { VideoErrorBanner } from '../../components/video-error-banners';
import { Skeleton } from '../../components/ui/skeleton';
import { JobTabs } from '../../components/job-tabs';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { PulsatingBorder } from '../../components/pulsating-border';
import { Tip } from '../../components/ui/tooltip';
import { Button } from '../../components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../components/ui/popover';

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
            <InfoAndOptions video={video} />
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

type Video = inferProcedureOutput<AppRouter['videos']['myVideos']>[number];

type InfoAndOptionsProps = {
  video: Video;
};

function InfoAndOptions({ video }: InfoAndOptionsProps) {
  const formattedTime = useMemo(
    () => moment(video.createdAt).fromNow(),
    [video],
  );
  const completedJobs = useMemo(() => {
    let count = 0;

    if (video.transcriptResult) count++;
    if (video.rekognitionObjects) count++;
    if (video.analysisResult) count++;

    return count;
  }, [video]);

  const { data: me } = trpc.auth.me.useQuery(undefined, {
    trpc: { context: { skipBatch: true } },
  });

  // We'll display badges in different places depending on screen size
  const badges = (
    <>
      <Tip
        content={
          me?.id === video.userId
            ? 'You can change visibility on the video settings menu'
            : ''
        }
      >
        {video.visibility === 'PUBLIC' ? (
          <Badge variant="secondary" className="flex-row gap-1">
            <Eye className="h-[0.85rem] w-[0.85rem] stroke-[2.5]" />
            Public
          </Badge>
        ) : (
          <Badge variant="secondary" className="flex-row gap-1.5">
            <Lock className="h-3 w-3 stroke-[2.5]" />
            Private
          </Badge>
        )}
      </Tip>
      {video.transcriptError ||
      video.rekognitionObjectsError ||
      video.analysisError ? (
        <Tip content="Check for errors on each job tab">
          <div className="w-fit flex-row gap-1.5 rounded-full border py-1.5 pl-1.5 pr-2">
            <XCircle className="text-destructive h-4 w-4" />
            <span className="text-primary text-xs font-medium">
              {completedJobs}/3 jobs
            </span>
          </div>
        </Tip>
      ) : completedJobs === 3 ? (
        <div className="w-fit flex-row gap-1.5 rounded-full border py-1.5 pl-1.5 pr-2">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span className="text-primary text-xs font-medium">
            {completedJobs}/3 jobs
          </span>
        </div>
      ) : (
        <PulsatingBorder className="py-1.5 pl-1.5 pr-2">
          <Cpu className="text-primary animate-spring-spin h-4 w-4" />
          <span className="text-primary animate-pulse text-xs font-medium">
            {completedJobs}/3 jobs
          </span>
        </PulsatingBorder>
      )}
    </>
  );

  return (
    <div className="gap-3">
      <h1 className="text-2xl font-medium leading-none">{video.fileName}</h1>
      <div className="flex-row justify-between">
        <div className="flex-row items-center gap-2">
          <Avatar className="h-9 w-9 cursor-pointer">
            <AvatarImage src={video.userPicture} alt="user picture" />
            <AvatarFallback className="text-sm">
              {video.userName.split(' ')[0][0]}
              {video.userName.split(' ')[1][0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <span className="text-primary text-md font-medium leading-none">
              {video.userName}
            </span>
            <span className="text-muted-foreground text-xs">
              Uploaded {formattedTime}
            </span>
          </div>
        </div>
        <div className="flex-row items-center gap-3">
          <div className="hidden flex-row items-center gap-3 sm:flex">
            {badges}
          </div>
          <Options video={video} />
        </div>
      </div>
      <div className="flex-row items-center gap-3 sm:hidden">{badges}</div>
      <p className="text-muted-foreground text-sm">
        Showcase of AI-driven analysis with AWS-powered services, offering
        transcriptions, object detection, and intelligent Q&A through cloud
        technology.
      </p>
    </div>
  );
}

type OptionsProps = {
  video: Video;
};

function Options({ video }: OptionsProps) {
  const [open, setOpen] = useState(false);

  const router = useRouter();

  const utils = trpc.useUtils();

  const { data: me } = trpc.auth.me.useQuery(undefined, {
    trpc: { context: { skipBatch: true } },
  });

  const { mutate: changeVisibility, error: changeVisibilityError } =
    trpc.videos.changeVisibility.useMutation();

  const { mutateAsync: deleteAsync, isPending: isDeleting } =
    trpc.videos.delete.useMutation();

  // Revert optimistic update in case of error and warn user
  useEffect(() => {
    if (changeVisibilityError) {
      toast.error('Error changing video visibility', {
        description: changeVisibilityError.message,
      });

      utils.videos.singleVideo.setData({ videoId: video.id }, (oldData) => ({
        ...oldData!,
        visibility: oldData!.visibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC',
      }));
    }
  }, [changeVisibilityError, utils.videos.singleVideo, video.id]);

  if (me?.id !== video.userId) return null;

  function handleChangeVisibility() {
    const newVisibility = video.visibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC';

    changeVisibility({
      videoId: video.id,
      visibility: newVisibility,
    });

    utils.videos.singleVideo.setData({ videoId: video.id }, (oldData) => ({
      ...oldData!,
      visibility: newVisibility,
    }));

    setOpen(false);
  }

  async function handleDelete() {
    try {
      const { message } = await deleteAsync({ videoId: video.id });

      toast.success(message);
      setOpen(false);
      utils.videos.myVideos.invalidate();
      utils.videos.publicVideos.invalidate();
      router.push('/videos');
    } catch (err) {
      const error = err as TRPCClientError<AppRouter>;
      toast.error('Error deleting video', { description: error.message });
    }

    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings2 className="h-4 w-4" />
          <span className="sr-only">Video settings</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-fit p-[0.25rem]">
        {video.visibility === 'PUBLIC' ? (
          <Button
            variant="ghost"
            className="h-8 font-normal"
            onClick={handleChangeVisibility}
          >
            <Lock className="ml-1 h-3 w-3" />
            Set private
          </Button>
        ) : (
          <Button
            variant="ghost"
            className="h-8 font-normal"
            onClick={handleChangeVisibility}
          >
            <Eye className="h-4 w-4" />
            Set public
          </Button>
        )}
        <Button
          variant="ghost"
          className="text-destructive hover:text-destructive h-8 font-normal hover:bg-red-100"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader2 className="-ml-3 mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="-ml-3 mr-2 h-4 w-4" />
          )}
          Delete
        </Button>
      </PopoverContent>
    </Popover>
  );
}
