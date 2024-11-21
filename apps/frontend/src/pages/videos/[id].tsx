import { useRouter } from 'next/router';

import { PageLayout } from '../../components/page-layout';
import { trpc } from '../../utils/trpc';
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
        <div className="gap-6">
          <VideoPlayer video={video} />
          <div className="gap-2">
            <h1 className="text-2xl font-medium leading-none">
              {video.fileName}
            </h1>
            <p className="text-muted-foreground text-md">
              Showcase of AI-driven analysis with AWS-powered services, offering
              transcriptions, object detection, and intelligent Q&A through
              advanced cloud technology.
            </p>
            <JobTabs />
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

function JobTabs() {
  return (
    <Tabs defaultValue="transcript">
      <TabsList className="flex-row">
        <TabsTrigger value="transcript">Transcript</TabsTrigger>
        <Separator orientation="vertical" className="h-[50%]" />
        <TabsTrigger value="summary">Summary</TabsTrigger>
        <Separator orientation="vertical" className="h-[50%]" />
        <TabsTrigger value="prompt">Prompt</TabsTrigger>
      </TabsList>
      <TabsContent value="transcript">
        <div>Transcript</div>
      </TabsContent>
      <TabsContent value="summary">
        <div>Summary</div>
      </TabsContent>
      <TabsContent value="prompt">
        <div>Prompt</div>
      </TabsContent>
    </Tabs>
  );
}
