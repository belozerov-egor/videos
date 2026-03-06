import request from 'supertest';
import express from 'express';
import { setupApp } from '../../src/setup-app';
import { HttpStatus } from '../../src/core/types/http-statuses';
import {
  AvailableResolutions,
  Video,
  VideoInputDto,
} from '../../src/videos/types/videos.types';
import { ROUTES } from '../../src/core/utils/routes';

describe('Videos API', () => {
  const app = express();
  setupApp(app);

  const testVideoData: VideoInputDto = {
    title: 'Film',
    author: 'Ivanov',
    availableResolutions: [
      AvailableResolutions.P144,
      AvailableResolutions.P240,
    ],
  };

  beforeAll(async () => {
    await request(app).delete('/testing/all-data').expect(HttpStatus.NoContent);
  });

  it('should create video; POST video', async () => {
    const newVideo: VideoInputDto = {
      title: 'Film',
      author: 'Ivanov',
      availableResolutions: [
        AvailableResolutions.P144,
        AvailableResolutions.P240,
      ],
    };

    await request(app)
      .post(ROUTES.videos)
      .send(newVideo)
      .expect(HttpStatus.Created);
  });

  it('should return drivers list; GET /drivers', async () => {
    await request(app)
      .post(ROUTES.videos)
      .send({ ...testVideoData, title: 'Film1' })
      .expect(HttpStatus.Created);

    await request(app)
      .post(ROUTES.videos)
      .send({ ...testVideoData, title: 'Film2' })
      .expect(HttpStatus.Created);

    const videosListResponse = await request(app)
      .get(ROUTES.videos)
      .expect(HttpStatus.Ok);

    expect(videosListResponse.body).toBeInstanceOf(Array);
    expect(videosListResponse.body.length).toBeGreaterThanOrEqual(2);
    const item = videosListResponse.body.find(
      (v: Video) => v.title === 'Film1',
    );
    expect(item).toBeDefined();
    expect(item.title).toBe('Film1');
  });

  it('should return video by id; GET /videos/:id', async () => {
    const createResponse = await request(app)
      .post(ROUTES.videos)
      .send({ ...testVideoData, title: 'Another Film' })
      .expect(HttpStatus.Created);

    const getResponse = await request(app)
      .get(`${ROUTES.videos}/${createResponse.body.id}`)
      .expect(HttpStatus.Ok);

    expect(getResponse.body).toEqual({
      ...createResponse.body,
      id: expect.any(Number),
      createdAt: expect.any(String),
    });
  });
  it('should delete video by id; DELETE /videos/:id', async () => {
    const createResponse = await request(app)
      .post(ROUTES.videos)
      .send({ ...testVideoData, title: 'Deleted Film' })
      .expect(HttpStatus.Created);

    await request(app)
      .delete(`${ROUTES.videos}/${createResponse.body.id}`)
      .expect(HttpStatus.NoContent);

    await request(app)
      .delete(`${ROUTES.videos}/${createResponse.body.id}`)
      .expect(HttpStatus.NotFound);

    await request(app)
      .get(`${ROUTES.videos}/${createResponse.body.id}`)
      .expect(HttpStatus.NotFound);
  });
  it('should change video by id; PUT /videos/:id', async () => {
    const nonExistingId = 999999;
    const newBody = {
      title: 'Change Film',
      author: 'New Author',
      availableResolutions: [AvailableResolutions.P2160],
      canBeDownloaded: true,
      minAgeRestriction: 18,
      publicationDate: new Date(),
    };
    const createResponse = await request(app)
      .post(ROUTES.videos)
      .send({ ...testVideoData, title: 'New Film' })
      .expect(HttpStatus.Created);

    await request(app)
      .put(`${ROUTES.videos}/${nonExistingId}`)
      .expect(HttpStatus.NotFound);
    await request(app)
      .put(`${ROUTES.videos}/${createResponse.body.id}`)
      .send(newBody)
      .expect(HttpStatus.NoContent);
    await request(app)
      .put(`${ROUTES.videos}/${createResponse.body.id}`)
      .send({ ...newBody, canBeDownloaded: 1 })
      .expect(HttpStatus.BadRequest);
    const videoResponse = await request(app)
      .get(`${ROUTES.videos}/${createResponse.body.id}`)
      .expect(HttpStatus.Ok);

    expect(videoResponse.body.title).toBe('Change Film');
  });
});
