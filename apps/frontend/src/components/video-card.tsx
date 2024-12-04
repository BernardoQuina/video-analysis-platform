import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { inferProcedureOutput } from '@trpc/server';
import moment from 'moment';
import { CheckCircle2, Cpu, Eye, XCircle, Lock } from 'lucide-react';

import { AppRouter } from '../../../api/src/routers/index.router';
import { cn } from '../utils/cn';

import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Skeleton } from './ui/skeleton';
import { Tip } from './ui/tooltip';
import { PulsatingBorder } from './pulsating-border';
import { Badge } from './ui/badge';

type Video = inferProcedureOutput<AppRouter['videos']['myVideos']>[number];

type VideoCardProps = {
  video: Video;
  isMyVideos?: boolean;
};

const mediaUrl = process.env.NEXT_PUBLIC_MEDIA_URL;

const shapeClass =
  'w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.33%-0.69rem)] gap-2';

export function VideoCard({ video, isMyVideos }: VideoCardProps) {
  const formattedTime = useMemo(
    () => moment(video.createdAt).fromNow(),
    [video],
  );

  const videoDuration = useMemo(() => {
    // Floor the input to ensure whole seconds
    const flooredTime = Math.floor(video.duration);

    // Use moment.duration to handle the time conversion
    const duration = moment.duration(flooredTime, 'seconds');

    // Format the duration as "MM:SS"
    const formattedTime = moment.utc(duration.asMilliseconds()).format('mm:ss');

    return formattedTime;
  }, [video.duration]);

  const completedJobs = useMemo(() => {
    let count = 0;

    if (video.transcriptResult) count++;
    if (video.summaryResult) count++;
    if (video.promptResult) count++;
    if (video.rekognitionObjects) count++;

    return count;
  }, [video]);

  return (
    <Link
      href={`/videos/${video.id}`}
      className={cn(shapeClass, 'group')}
      scroll={false}
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-lg shadow-md">
        <Image
          className="h-full w-full object-cover transition duration-300 ease-in-out group-hover:scale-105"
          alt={`${video.fileName} thumbnail`}
          src={`${mediaUrl}/${video.thumbnailS3Key}`}
          width={900}
          height={600}
        />
        {!isMyVideos ? null : video.visibility === 'PUBLIC' ? (
          <Badge
            variant="secondary"
            className="bg-background-dark/30 supports-[backdrop-filter]:bg-background-dark/40 absolute left-3 top-3 flex-row gap-1 text-white backdrop-blur"
          >
            <Eye className="h-[0.85rem] w-[0.85rem] stroke-[2.5]" />
            Public
          </Badge>
        ) : (
          <Badge
            variant="secondary"
            className="bg-background-dark/30 supports-[backdrop-filter]:bg-background-dark/40 absolute left-3 top-3 flex-row gap-1.5 text-white backdrop-blur"
          >
            <Lock className="h-3 w-3 stroke-[2.5]" />
            Private
          </Badge>
        )}

        <Badge
          variant="secondary"
          className="bg-background-dark/30 supports-[backdrop-filter]:bg-background-dark/40 absolute bottom-3 right-3 flex-row gap-1 text-white backdrop-blur"
        >
          {videoDuration}
        </Badge>
      </div>
      <div className="gap-3">
        <h3 className="text-md line-clamp-2 font-medium leading-5">
          {video.fileName}
        </h3>
        <div className="flex-row items-center justify-between">
          <div className="flex-row items-center gap-2 rounded-full">
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarImage src={video.userPicture} alt="user picture" />
              <AvatarFallback className="text-xs">
                {video.userName.split(' ')[0][0]}
                {video.userName.split(' ')[1][0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <span className="text-primary text-sm font-medium leading-none">
                {video.userName}
              </span>
              <span className="text-muted-foreground text-xs">
                Uploaded {formattedTime}
              </span>
            </div>
          </div>
          {video.transcriptError ||
          video.summaryError ||
          video.promptError ||
          video.rekognitionObjectsError ? (
            <Tip content="Check for errors on each job tab">
              <div className="w-fit flex-row gap-1.5 rounded-full border py-1.5 pl-1.5 pr-2">
                <XCircle className="text-destructive h-4 w-4" />
                <span className="text-primary text-xs font-medium">
                  {completedJobs}/4 jobs
                </span>
              </div>
            </Tip>
          ) : completedJobs === 4 ? (
            <div className="w-fit flex-row gap-1.5 rounded-full border py-1.5 pl-1.5 pr-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-primary text-xs font-medium">
                {completedJobs}/4 jobs
              </span>
            </div>
          ) : (
            <PulsatingBorder className="py-1.5 pl-1.5 pr-2">
              <Cpu className="text-primary animate-spring-spin h-4 w-4" />
              <span className="text-primary animate-pulse text-xs font-medium">
                {completedJobs}/4 jobs
              </span>
            </PulsatingBorder>
          )}
        </div>
      </div>
    </Link>
  );
}

export function VideoCardSkeleton() {
  return (
    <div className={shapeClass}>
      <Skeleton className="aspect-video w-full" />
      <Skeleton className="h-4 w-[90%]" />
      <div className="flex-row items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="w-[50%] justify-center gap-2">
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-2 w-[60%]" />
        </div>

        <Skeleton className="ml-auto h-6 w-14 rounded-full" />
      </div>
    </div>
  );
}
