import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import { PageLayout } from '../../components/page-layout';
import { trpc } from '../../utils/trpc';
import { Card, CardContent } from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';
import { UploadDialog } from '../../components/upload-dialog';
import { VideoCard, VideoCardSkeleton } from '../../components/video-card';

export default function Videos() {
  const { data: me } = trpc.auth.me.useQuery(undefined, {
    trpc: { context: { skipBatch: true } },
  });

  const {
    data: myVideos,
    isLoading: loadingMyVideos,
    error: myVideosError,
  } = trpc.videos.myVideos.useQuery(undefined, { enabled: !!me });

  const {
    data: publicVideos,
    isLoading: loadingPublicVideos,
    error: publicVideosError,
  } = trpc.videos.publicVideos.useQuery();

  useEffect(() => {
    if (myVideosError && myVideosError.data?.code !== 'UNAUTHORIZED') {
      toast.error('An error occurred while loading your videos', {
        description: myVideosError.message,
      });
    }

    if (publicVideosError) {
      toast.error('An error occurred while loading public videos', {
        description: publicVideosError.message,
      });
    }
  }, [myVideosError, publicVideosError]);

  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  const { mutateAsync } = trpc.auth.exchangeCodeForToken.useMutation();

  const utils = trpc.useUtils();

  const router = useRouter();

  useEffect(() => {
    if (!code) return;

    const signIn = async () => {
      const { message } = await mutateAsync({ code, path: '/videos' });

      if (message === 'Authenticated') {
        utils.auth.me.invalidate();

        router.push('/videos');
      }
    };

    signIn();
  }, [code, mutateAsync, router, utils.auth.me]);

  return (
    <PageLayout
      pageTitle="Video Analysis Library"
      pageDescription="Discover and explore video analyses in the Video Analysis Library. Access your own videos insights and browse public analyses from other users"
    >
      <div className="gap-6">
        <div className="gap-4">
          <div>
            <div className="flex-row items-end justify-between">
              <h2 className="text-lg font-medium">Your Videos</h2>
              {(myVideos?.length ?? 0) > 0 && <UploadDialog />}
            </div>
            <p className="text-muted-foreground text-sm">
              Your video uploads and respective AI analyses.
            </p>
          </div>
          {loadingMyVideos ? (
            <div className="flex-row flex-wrap gap-4">
              {new Array(6).fill(0).map((_, i) => (
                <VideoCardSkeleton key={i} />
              ))}
            </div>
          ) : (myVideos ?? []).length === 0 ? (
            <div className="items-center pt-2">
              <Card>
                <CardContent className="flex-row items-center gap-4">
                  <div>
                    <h2 className="w-fit text-lg font-medium">
                      You haven&apos;t uploaded yet!
                    </h2>
                    <p className="text-muted-foreground w-fit text-sm">
                      Upload any mp4 video and see what insights you can get!
                    </p>
                  </div>
                  <UploadDialog />
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="w-full flex-row flex-wrap gap-x-4 gap-y-8 pb-4">
              {myVideos!.map((video) => (
                <VideoCard key={video.id} video={video} isMyVideos />
              ))}
            </div>
          )}
        </div>
        <Separator />
        <div className="gap-4">
          <div>
            <h2 className="text-lg font-medium">Public Videos</h2>
            <p className="text-muted-foreground text-sm">
              Discover and explore video analysis made public from other users.
            </p>
          </div>
          {loadingPublicVideos ? (
            <div className="flex-row flex-wrap gap-4">
              {new Array(6).fill(0).map((_, i) => (
                <VideoCardSkeleton key={i} />
              ))}
            </div>
          ) : (publicVideos ?? []).length === 0 ? (
            <div className="items-center pt-2">
              <Card>
                <CardContent className="flex-row items-center gap-4">
                  <div>
                    <h2 className="w-fit text-lg font-medium">
                      No public videos yet
                    </h2>
                    <p className="text-muted-foreground w-fit text-sm">
                      You can upload some videos of your own and make them
                      public!
                    </p>
                  </div>
                  <UploadDialog />
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="items-center gap-8 pb-8">
              <div className="w-full flex-row flex-wrap gap-x-4 gap-y-8">
                {publicVideos!.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
              <div className="bg-muted-foreground/60 h-2 w-2 rounded-full"></div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
