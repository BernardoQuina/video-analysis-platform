/* eslint-disable @typescript-eslint/no-namespace */
import { z } from 'zod';

const envVariables = z.object({
  NEXT_PUBLIC_API_URL: z.string(),
});

envVariables.parse(process.env);

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envVariables> {}
  }
}
