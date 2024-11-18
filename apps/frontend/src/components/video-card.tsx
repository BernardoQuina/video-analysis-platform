import Image from 'next/image';
import { inferProcedureOutput } from '@trpc/server';

import { AppRouter } from '../../../api/src/routers/index.router';

type Video = inferProcedureOutput<AppRouter['videos']['myVideos']>[number];

type VideoCardProps = {
  video: Video;
};

export function VideoCard({ video }: VideoCardProps) {
  return (
    <div className="relative aspect-video w-full justify-end rounded-md bg-[url()] sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.33%-0.69rem)]">
      <Image
        className="absolute left-0 h-full w-full"
        alt={`${video.fileName} thumbnail`}
        src={`${process.env.NEXT_PUBLIC_MEDIA_URL}/${video.thumbnailS3Key}`}
        width={900}
        height={600}
      />
      <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 backdrop-blur">
        <h3>{video.fileName}</h3>
      </div>
    </div>
  );
}
