import { useEffect, useRef } from 'react';
import {
  isHLSProvider,
  MediaPlayer,
  MediaProvider,
  // Poster,
  // Track,
  type MediaCanPlayDetail,
  type MediaCanPlayEvent,
  type MediaPlayerInstance,
  type MediaProviderAdapter,
  type MediaProviderChangeEvent,
} from '@vidstack/react';
import '@vidstack/react/player/styles/base.css';

import { RouterOutput } from '../../utils/trpc';
import { cn } from '../../utils/cn';

import { VideoLayout } from './layout';

type VideoPlayerProps = {
  video: RouterOutput['videos']['singleVideo'];
};

const mediaUrl = process.env.NEXT_PUBLIC_MEDIA_URL;

export function VideoPlayer({ video }: VideoPlayerProps) {
  const player = useRef<MediaPlayerInstance>(null);

  useEffect(() => {
    // Subscribe to state updates.
    return player.current!.subscribe(() => {
      // console.log('is paused?', '->', state.paused);
      // console.log('is audio view?', '->', state.viewType === 'audio');
    });
  }, []);

  function onProviderChange(
    provider: MediaProviderAdapter | null,
    _nativeEvent: MediaProviderChangeEvent,
  ) {
    // We can configure provider's here.
    if (isHLSProvider(provider)) {
      provider.config = {};
    }
  }

  // We can listen for the `can-play` event to be notified when the player is ready.
  function onCanPlay(
    _detail: MediaCanPlayDetail,
    _nativeEvent: MediaCanPlayEvent,
  ) {
    // ...
  }

  const aspectClass = `aspect-[${video.aspectRatio || 1.78}]`; // default to 16/9

  return (
    <MediaPlayer
      className={cn(
        aspectClass,
        'ring-media-focus bg-background-dark -ml-4 -mt-4 max-h-[70vh] min-w-[calc(100%+2rem)] overflow-hidden text-white shadow-md data-[focus]:ring-2 md:ml-0 md:mt-0 md:min-w-full md:rounded-md',
      )}
      aspectRatio={video.aspectRatio.toString()}
      title={video.fileName}
      src={`${mediaUrl}/${video.s3Key}`}
      playsInline
      onProviderChange={onProviderChange}
      onCanPlay={onCanPlay}
      ref={player}
    >
      <MediaProvider>
        {/* <Poster
          className="absolute inset-0 block h-full w-full rounded-md object-cover opacity-0 transition-opacity data-[visible]:opacity-100"
          src="https://files.vidstack.io/sprite-fight/poster.webp"
          alt="Girl walks into campfire with gnomes surrounding her friend ready for their next meal!"
        /> */}
        {/* {textTracks.map((track) => (
          <Track {...track} key={track.src} />
        ))} */}
      </MediaProvider>
      <VideoLayout />
    </MediaPlayer>
  );
}
