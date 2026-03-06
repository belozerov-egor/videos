import express, { Express, Request, Response } from 'express';
import { testingRouter } from './testing/routers/testing.router';
import { ROUTES } from './core/utils/routes';
import { videosRouter } from './videos/router/videos.router';

export const setupApp = (app: Express) => {
  app.use(express.json());

  app.get('/', (req: Request, res: Response) => {
    res.status(200).send('hello world!!!');
  });

  app.use(ROUTES.videos, videosRouter);
    app.use('/testing', testingRouter);


  return app;
};
