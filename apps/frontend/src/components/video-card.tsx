import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { inferProcedureOutput } from '@trpc/server';
import moment from 'moment';
import { Cpu, Eye } from 'lucide-react';

import { AppRouter } from '../../../api/src/routers/index.router';
import { cn } from '../utils/cn';

import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Skeleton } from './ui/skeleton';

type Video = inferProcedureOutput<AppRouter['videos']['myVideos']>[number];

type VideoCardProps = {
  video: Video;
};

const mediaUrl = process.env.NEXT_PUBLIC_MEDIA_URL;

const shapeClass =
  'aspect-video w-full border rounded-md border shadow-sm sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.33%-0.69rem)]';

export function VideoCard({ video }: VideoCardProps) {
  const formattedTime = useMemo(
    () => moment(video.createdAt).fromNow(),
    [video],
  );
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
      className={cn(shapeClass, 'group relative justify-end overflow-hidden')}
    >
      <Image
        className="absolute left-0 h-full w-full object-cover transition duration-300 ease-in-out group-hover:scale-105"
        alt={`${video.fileName} thumbnail`}
        src={`${mediaUrl}/${video.thumbnailS3Key}`}
        width={900}
        height={600}
      />
      <div className="supports-[backdrop-filter]:bg-background-dark/30 absolute left-4 top-3 z-10 flex-row items-center gap-1.5 rounded-full p-1 pr-2 backdrop-blur-md">
        <Avatar className="h-6 w-6 cursor-pointer">
          <AvatarImage src={video.userPicture} alt="user picture" />
          <AvatarFallback className="text-xs">
            {video.userName.split(' ')[0][0]}
            {video.userName.split(' ')[1][0]}
          </AvatarFallback>
        </Avatar>
        <span className="text-primary-dark text-xs font-medium">
          {video.userName}
        </span>
      </div>
      <div className="supports-[backdrop-filter]:bg-background-dark/30 absolute right-4 top-3 z-10 flex-row items-center gap-1.5 rounded-full p-2 backdrop-blur-md">
        <Cpu
          className={cn('text-primary-dark h-4 w-4', {
            'animate-spring-spin': completedJobs !== 4,
          })}
        />
        <span className="text-primary-dark text-xs font-medium">
          {completedJobs}/4 jobs
        </span>
      </div>
      <div className="supports-[backdrop-filter]:bg-background-dark/30 px-4 py-2 backdrop-blur-md">
        <h3 className="text-primary-dark text-sm font-medium">
          {video.fileName}
        </h3>
        <div className="flex-row items-center gap-4">
          <span className="text-primary-dark text-xs font-medium">
            {formattedTime}
          </span>
          <div className="flex-row items-center gap-0.5">
            <Eye className="text-primary-dark h-3 w-3" />
            <span className="text-primary-dark text-xs font-medium">
              Public
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function VideoCardSkeleton() {
  return <Skeleton className={shapeClass} />;
}
