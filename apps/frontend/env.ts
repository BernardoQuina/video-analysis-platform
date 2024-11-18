/* eslint-disable @typescript-eslint/no-namespace */
import { z } from 'zod';

const envVariables = z.object({
  NEXT_PUBLIC_API_URL: z.string(),
  NEXT_PUBLIC_MEDIA_URL: z.string(),
  NEXT_PUBLIC_COGNITO_DOMAIN: z.string(),
  NEXT_PUBLIC_COGNITO_CLIENT_ID: z.string(),
});

envVariables.parse(process.env);

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envVariables> {}
  }
}
