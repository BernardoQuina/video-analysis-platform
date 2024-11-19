import { useRouter } from 'next/router';

import { PageLayout } from '../../components/page-layout';
import { trpc } from '../../utils/trpc';
import { VideoPlayer } from '../../components/video-player';

export default function Videos() {
  const router = useRouter();

  const { id } = router.query;

  const { data: video } = trpc.videos.singleVideo.useQuery(
    { videoId: id as string },
    { enabled: !!id },
  );

  return (
    <PageLayout
      pageTitle="Video Analysis Library"
      pageDescription="Discover and explore video analyses in the Video Analysis Library. Access your own videos insights and browse public analyses from other users"
    >
      <div>{video ? <VideoPlayer video={video} /> : 'loading...'}</div>
    </PageLayout>
  );
}
