import { httpBatchLink } from '@trpc/client';
import { createTRPCNext } from '@trpc/next';

import type { AppRouter } from '../../../api/src/routers/index.router';

export const trpc = createTRPCNext<AppRouter>({
  config() {
    return {
      links: [
        httpBatchLink({
          url: `${process.env.NEXT_PUBLIC_API_URL}/trpc`,
          fetch(url, options) {
            return fetch(url, { ...options, credentials: 'include' });
          },
          async headers() {
            return {};
          },
        }),
      ],
    };
  },
  ssr: false,
});
