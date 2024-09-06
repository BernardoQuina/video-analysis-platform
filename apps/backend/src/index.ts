import express from 'express';
import cors from 'cors';
import * as trpcExpress from '@trpc/server/adapters/express';

import { appRouter } from './routes';

const PORT = 4000;

// Create context for each request
const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => ({ req, res });

const app = express();

app.use(cors());

app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({ router: appRouter, createContext }),
);

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
