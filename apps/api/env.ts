/* eslint-disable @typescript-eslint/no-namespace */
import { z } from 'zod';

const envVariables = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  FRONTEND_URL: z.string(),
  COGNITO_CLIENT_ID: z.string(),
  COGNITO_CLIENT_SECRET: z.string(),
  COGNITO_USER_POOL_ID: z.string(),
  COGNITO_DOMAIN: z.string(),
  AWS_REGION: z.string(),
  DYNAMODB_TABLE_NAME: z.string(),
});

envVariables.parse(process.env);

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envVariables> {}
  }
}
