import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function ScrollToTop() {
  // When clicking a link, it will not scroll to the top of the page if the header is sticky.
  // The current scroll position will persist to the next page.
  // For me this bug is only happening on Chrome mobile on iOS as far as I'm aware
  // This useEffect is a workaround to 'fix' that behavior.
  // GitHub issue: https://github.com/vercel/next.js/discussions/64435

  const pathname = usePathname();

  useEffect(() => {
    setTimeout(() => {
      window.scroll(0, 0);
    }, 5000);
  }, [pathname]);
  return <></>;
}
