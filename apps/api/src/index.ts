/* eslint-disable no-console */

import cluster from 'node:cluster';
import os from 'node:os';

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import * as trpcExpress from '@trpc/server/adapters/express';

import { appRouter } from './routers/index.router';
import { createContext } from './utils/trpc';

const PORT = 4000;

if (cluster.isPrimary) {
  console.log(`Primary process ${process.pid} is running`);

  const coreCount = os.availableParallelism();

  for (let i = 0; i < coreCount; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(
      `Worker ${worker.process.pid} died with code ${code}: ${signal}`,
    );

    // Restart the worker
    console.log('Starting a new worker...');
    cluster.fork();
  });
} else {
  const app = express();

  app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
  app.use(cookieParser());

  app.use(
    '/trpc',
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext,
    }),
  );

  app.get('/health', (req, res) => res.status(200).send('healthy!'));

  app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
}
