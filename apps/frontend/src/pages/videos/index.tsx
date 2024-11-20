import { useEffect } from 'react';
import { toast } from 'sonner';

import { PageLayout } from '../../components/page-layout';
import { trpc } from '../../utils/trpc';
import { Card, CardContent } from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';
import { UploadDialog } from '../../components/upload-dialog';
import { VideoCard, VideoCardSkeleton } from '../../components/video-card';

export default function Videos() {
  const {
    data: myVideos,
    isLoading: loadingMyVideos,
    error: myVideosError,
  } = trpc.videos.myVideos.useQuery();

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

  return (
    <PageLayout
      pageTitle="Video Analysis Library"
      pageDescription="Discover and explore video analyses in the Video Analysis Library. Access your own videos insights and browse public analyses from other users"
    >
      <div className="gap-6">
        <div className="gap-4">
          <div className="gap-1">
            <h2 className="text-2xl font-medium">Your Videos</h2>
            <p className="text-muted-foreground text-base">
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
            <div className="items-center pt-8">
              <Card>
                <CardContent className="flex-row items-center gap-4">
                  <div className="gap-1">
                    <h2 className="w-fit text-xl font-medium">
                      You haven&apos;t uploaded yet!
                    </h2>
                    <p className="text-muted-foreground w-fit text-base">
                      Upload any mp4 video and see what insights you can get!
                    </p>
                  </div>
                  <UploadDialog />
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex-row flex-wrap gap-4">
              {myVideos!.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          )}
        </div>
        <Separator />
        <div className="gap-4">
          <div className="gap-1">
            <h2 className="text-2xl font-medium">Public Videos</h2>
            <p className="text-muted-foreground text-base">
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
            <div className="items-center pt-8">
              <Card>
                <CardContent className="flex-row items-center gap-4">
                  <div className="gap-1">
                    <h2 className="w-fit text-xl font-medium">
                      No public videos yet
                    </h2>
                    <p className="text-muted-foreground w-fit text-base">
                      You can upload some videos of your own and make them
                      public!
                    </p>
                  </div>
                  <UploadDialog />
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex-row flex-wrap gap-2">
              {publicVideos!.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
