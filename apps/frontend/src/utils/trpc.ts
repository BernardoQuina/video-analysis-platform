import { httpBatchLink } from '@trpc/client';
import { createTRPCNext } from '@trpc/next';

import type { AppRouter } from '../../../backend/src/routes';

const url = 'http://localhost:4000/trpc';

export const trpc = createTRPCNext<AppRouter>({
  config() {
    return {
      links: [
        httpBatchLink({
          url,
          async headers() {
            return {};
          },
        }),
      ],
    };
  },
  ssr: false,
});
