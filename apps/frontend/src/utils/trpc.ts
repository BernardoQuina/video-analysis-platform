import {
  splitLink,
  httpLink,
  httpBatchLink,
  HTTPLinkOptions,
  HTTPBatchLinkOptions,
} from '@trpc/client';
import { createTRPCNext } from '@trpc/next';

import type { AppRouter } from '../../../api/src/routers/index.router';

const linkOptions: HTTPLinkOptions<AppRouter['_def']['_config']['$types']> = {
  url: `${process.env.NEXT_PUBLIC_API_URL}/trpc`,
  fetch(url, options) {
    return fetch(url, { ...options, credentials: 'include' });
  },
  async headers() {
    return {};
  },
};

export const trpc = createTRPCNext<AppRouter>({
  config() {
    return {
      links: [
        splitLink({
          condition(op) {
            // Check for context property `skipBatch`
            return Boolean(op.context.skipBatch);
          },
          // When condition is true, use normal request
          true: httpLink(linkOptions),
          // When condition is false, use batching
          false: httpBatchLink(
            linkOptions as HTTPBatchLinkOptions<
              AppRouter['_def']['_config']['$types']
            >,
          ),
        }),
      ],
    };
  },
  ssr: false,
});
