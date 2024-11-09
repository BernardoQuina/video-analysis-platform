import { useDB } from '@repo/db';

export const db = useDB({
  region: process.env.AWS_REGION!,
  tableName: process.env.DYNAMODB_TABLE_NAME!,
});
