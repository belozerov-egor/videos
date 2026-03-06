import { Request, Response, Router } from 'express';
import { db } from '../../db/db';
import { HttpStatus } from '../../core/types/http-statuses';
import { createErrorMessages } from '../../core/utils/error.utils';
import { Video } from '../types/videos.types';
import { videoInputValidation } from '../validation/video-input-validation';
import { ROUTES } from '../../core/utils/routes';

export const videosRouter = Router({});

videosRouter
  .get('', (req: Request, res: Response) => {
    res.status(200).send(db.videos);
  })
  .get(ROUTES.videosId, (req: Request<{id: string}>, res: Response) => {
    const id = parseInt(req.params.id);
    const video = db.videos.find((d) => d.id === id);

    if (!video) {
      res
        .status(HttpStatus.NotFound)
        .send(
          createErrorMessages([{ field: 'id', message: 'Video not found' }]),
        );
      return;
    }
    res.status(200).send(video);
  })
  .delete(ROUTES.videosId, (req: Request<{id: string}>, res: Response) => {
    const id = parseInt(req.params.id);
    const videoIndex = db.videos.findIndex((d) => d.id === id);

    if (videoIndex === -1) {
      res.sendStatus(HttpStatus.NotFound);
      return;
    }

    db.videos.splice(videoIndex, 1);
    res.sendStatus(HttpStatus.NoContent);
  })
  .post('', (req: Request, res: Response) => {
    const errors = videoInputValidation(req.body);
    if (errors.length > 0) {
      res.status(HttpStatus.BadRequest).send(createErrorMessages(errors));
      return;
    }
    const createdAt = new Date();
    const publicationDate = new Date(createdAt);
    publicationDate.setDate(publicationDate.getDate() + 1);

    const newVideo: Video = {
      id: db.videos.length ? db.videos[db.videos.length - 1].id + 1 : 1,
      createdAt,
      publicationDate,
      canBeDownloaded: false,
      minAgeRestriction: null,
      ...req.body,
    };
    db.videos.push(newVideo);
    res.status(HttpStatus.Created).send(newVideo);
  })
  .put(ROUTES.videosId, (req: Request<{id: string}>, res: Response) => {
    const id = parseInt(req.params.id);
    const video = db.videos.find((d) => d.id === id);
    if (!video) {
      res.sendStatus(HttpStatus.NotFound);
      return;
    }
    const errors = videoInputValidation(req.body);
    if (errors.length > 0) {
      res.status(HttpStatus.BadRequest).send(createErrorMessages(errors));
      return;
    }
    video.title = req.body.title;
    video.author = req.body.author;
    video.availableResolutions = req.body.availableResolutions;
    video.canBeDownloaded = req.body.canBeDownloaded;
    video.minAgeRestriction = req.body.minAgeRestriction;
    video.publicationDate = new Date(req.body.publicationDate);
    res.sendStatus(HttpStatus.NoContent);
  });
