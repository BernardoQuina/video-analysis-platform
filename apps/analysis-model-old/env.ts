/* eslint-disable @typescript-eslint/no-namespace */
import { z } from 'zod';

const envVariables = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  SQS_QUEUE_URL: z.string(),
  MODEL_HOST: z.string(),
  MODEL_PORT: z.string(),
});

envVariables.parse(process.env);

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envVariables> {}
  }
}
