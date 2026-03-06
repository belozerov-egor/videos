import request from 'supertest';
import { setupApp } from '../../src/setup-app';
import express from 'express';
import { HttpStatus } from '../../src/core/types/http-statuses';
import {
  AvailableResolutions,
  VideoInputDto,
} from '../../src/videos/types/videos.types';
import { ROUTES } from '../../src/core/utils/routes';

describe('Videos API body validation check', () => {
  const app = express();
  setupApp(app);

  const correctTestVideoData: VideoInputDto = {
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

  it(`should not create video when incorrect body passed; POST /video'`, async () => {
    const invalidDataSet1 = await request(app)
      .post(ROUTES.videos)
      .send({
        ...correctTestVideoData,
        title: '   ',
        author: '    ',
        availableResolutions: [],
      })
      .expect(HttpStatus.BadRequest);

    expect(invalidDataSet1.body.errorsMessages).toHaveLength(3);

    const invalidDataSet2 = await request(app)
      .post(ROUTES.videos)
      .send({
        ...correctTestVideoData,
        title: '', // empty string
        author: '', // empty string
        availableResolutions: '', // incorrect number
      })
      .expect(HttpStatus.BadRequest);

    expect(invalidDataSet2.body.errorsMessages).toHaveLength(3);

    const invalidDataSet3 = await request(app)
      .post(ROUTES.videos)
      .send({
        ...correctTestVideoData,
        author: 'A'.repeat(21), // too shot
      })
      .expect(HttpStatus.BadRequest);

    expect(invalidDataSet3.body.errorsMessages).toHaveLength(1);

    const invalidDataSet4 = await request(app)
      .post(ROUTES.videos)
      .send({
        ...correctTestVideoData,
        title: 'T'.repeat(41), // > 40
      })
      .expect(HttpStatus.BadRequest);

    expect(invalidDataSet4.body.errorsMessages).toHaveLength(1);

    const invalidDataSet5 = await request(app)
      .post(ROUTES.videos)
      .send({
        ...correctTestVideoData,
        availableResolutions: ['P999'], // invalid enum value
      })
      .expect(HttpStatus.BadRequest);

    expect(invalidDataSet5.body.errorsMessages).toHaveLength(1);

    // check что никто не создался
    const videosResponse = await request(app).get(ROUTES.videos);
    expect(videosResponse.body).toHaveLength(0);
  });
  it(`should not update video when incorrect body passed; PUT /videos/:id`, async () => {
    const createResponse = await request(app)
      .post(ROUTES.videos)
      .send(correctTestVideoData)
      .expect(HttpStatus.Created);

    const invalidPut1 = await request(app)
      .put(`${ROUTES.videos}/${createResponse.body.id}`)
      .send({
        title: 'Ok title',
        author: 'Ok author',
        availableResolutions: [AvailableResolutions.P144],
        canBeDownloaded: 'true', // invalid
        minAgeRestriction: null,
        publicationDate: new Date().toISOString(),
      })
      .expect(HttpStatus.BadRequest);

    expect(invalidPut1.body.errorsMessages).toHaveLength(1);

    const invalidPut2 = await request(app)
      .put(`${ROUTES.videos}/${createResponse.body.id}`)
      .send({
        title: 'Ok title',
        author: 'Ok author',
        availableResolutions: [AvailableResolutions.P144],
        canBeDownloaded: true,
        minAgeRestriction: 19,
        publicationDate: new Date().toISOString(),
      })
      .expect(HttpStatus.BadRequest);

    expect(invalidPut2.body.errorsMessages).toHaveLength(1);

    const invalidPut3 = await request(app)
      .put(`${ROUTES.videos}/${createResponse.body.id}`)
      .send({
        title: 'Ok title',
        author: 'Ok author',
        availableResolutions: [AvailableResolutions.P144],
        canBeDownloaded: true,
        minAgeRestriction: null,
        publicationDate: '2020-01-01',
      })
      .expect(HttpStatus.BadRequest);

    expect(invalidPut3.body.errorsMessages).toHaveLength(1);
  });
});
