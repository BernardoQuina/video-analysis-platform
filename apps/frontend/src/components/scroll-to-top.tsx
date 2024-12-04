import { useRouter } from 'next/router';
import { useEffect } from 'react';

export function ScrollToTop() {
  // When clicking a link, it will not scroll to the top of the page if the header is sticky.
  // The current scroll position will persist to the next page.
  // For me this bug is only happening on Chrome mobile on iOS as far as I'm aware
  // This useEffect is a workaround to 'fix' that behavior.
  // GitHub issue: https://github.com/vercel/next.js/discussions/64435
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = () => {
      document.documentElement.scrollTop = 0; // For most browsers
      document.body.scrollTop = 0; // For Safari
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);
  return <></>;
}
